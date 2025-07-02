import { format } from "date-fns";

const PAGE_NAME = import.meta.env.VITE_FACEBOOK_PAGE;

export async function fetchTotalVideoViewsForPage(): Promise<number> {
  const accessToken = localStorage.getItem("fb_access_token");
  if (!accessToken) {
    throw new Error("Access token not found. Please log in first.");
  }

  // Lấy page access token và pageId như cũ
  const pagesRes = await fetch(`https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  const targetPage = pagesData.data.find((page: any) => page.name === PAGE_NAME);
  if (!targetPage) {
    throw new Error("Page 'Create AI Video' not found in your managed pages.");
  }
  const pageAccessToken = targetPage.access_token;
  const pageId = targetPage.id;

  // Lấy danh sách video
  const videosRes = await fetch(
    `https://graph.facebook.com/v23.0/${pageId}/videos?fields=id,title,description,created_time,permalink_url&limit=100&access_token=${pageAccessToken}`
  );
  const videosData = await videosRes.json();

  let totalViews = 0;
  for (const video of videosData.data) {
    const insightsRes = await fetch(
      `https://graph.facebook.com/v23.0/${video.id}/video_insights?metric=total_video_views,total_video_impressions,total_video_reactions_by_type_total&access_token=${pageAccessToken}`
    );
    const insightsData = await insightsRes.json();
    const viewsMetric = insightsData.data?.find((m: any) => m.name === "total_video_views");
    if (viewsMetric && viewsMetric.values && viewsMetric.values[0]) {
      totalViews += parseInt(viewsMetric.values[0].value || "0", 10);
    }
    // Log insight từng video
    console.log("Video:", video.title, "Insights:", JSON.stringify(insightsData, null, 2));
  }
  console.log("Total video views:", totalViews);

  return totalViews;
}

/**
 * Post a new video post to the Facebook page PAGE_NAME
 * @param videoUrl - The public URL of the video file
 * @param title - The title of the post
 * @param caption - The caption/description of the post
 * @param thumbnailUrl - The public URL of the thumbnail image
 */
export async function postVideoToPageWithThumbnail(
  videoUrl: string,
  title: string,
  caption: string,
  thumbnailUrl: string
): Promise<{ video_id: string; permalink_url?: string }> {
  const accessToken = localStorage.getItem("fb_access_token");
  if (!accessToken) {
    throw new Error("Access token not found. Please log in first.");
  }

  // Get the page access token and page ID
  const pagesRes = await fetch(`https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  const targetPage = pagesData.data.find((page: any) => page.name === PAGE_NAME);

  if (!targetPage) {
    throw new Error("Page 'Create AI Video' not found in your managed pages.");
  }

  const pageAccessToken = targetPage.access_token;
  const pageId = targetPage.id;

  // Download video file as Blob
  const videoBlob = await fetch(videoUrl).then(res => res.blob());
  // Download thumbnail as Blob
  const thumbBlob = await fetch(thumbnailUrl).then(res => res.blob());

  // Prepare FormData
  const formData = new FormData();
  formData.append("source", new File([videoBlob], "video.mp4", { type: videoBlob.type || "video/mp4" }));
  formData.append("title", title);
  formData.append("description", caption);
  formData.append("access_token", pageAccessToken);
  formData.append("thumb", new File([thumbBlob], "thumbnail.jpg", { type: thumbBlob.type || "image/jpeg" }));

  // Facebook Graph API endpoint for uploading video to a page
  const uploadRes = await fetch(`https://graph.facebook.com/v23.0/${pageId}/videos`, {
    method: "POST",
    body: formData,
  });

  const uploadData = await uploadRes.json();

  if (!uploadRes.ok) {
    throw new Error(uploadData.error?.message || "Failed to post video to Facebook page.");
  }

  // Try to get the permalink_url using the returned video_id
  let permalink_url: string | undefined = undefined;
  if (uploadData.id) {
    try {
      const detailRes = await fetch(
        `https://graph.facebook.com/v23.0/${uploadData.id}?fields=permalink_url&access_token=${pageAccessToken}`
      );
      const detailData = await detailRes.json();
      permalink_url = "https://www.facebook.com" + detailData.permalink_url;
    } catch {
      // ignore error, just return video_id
    }
  }

  return { video_id: uploadData.id, permalink_url };
}

/**
 * Lấy tổng lượt xem video của page theo từng tháng trong khoảng thời gian
 * @param startTime - ISO string hoặc timestamp (ví dụ: "2024-01-01")
 * @param endTime - ISO string hoặc timestamp (ví dụ: "2024-06-30")
 * @returns Array<{ month: string, views: number }>
/**
 * Lấy tổng views, likes, comments, shares của tất cả video trên page theo từng tháng
 */
export async function fetchMonthlyVideoStatsForPage(
  startTime: string,
  endTime: string
): Promise<
  { month: string; views: number; likes: number; comments: number; shares: number }[]
> {
  const accessToken = localStorage.getItem("fb_access_token");
  if (!accessToken) throw new Error("Access token not found. Please log in first.");

  // Lấy page access token và pageId như cũ
  const pagesRes = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}`
  );
  const pagesData = await pagesRes.json();
  const targetPage = pagesData.data.find((page: any) => page.name === PAGE_NAME);
  if (!targetPage) throw new Error("Page 'Create AI Video' not found in your managed pages.");
  const pageAccessToken = targetPage.access_token;
  const pageId = targetPage.id;

  // Lấy danh sách video trong khoảng thời gian
  let videos: any[] = [];
  let next = `https://graph.facebook.com/v23.0/${pageId}/videos?fields=id,created_time&limit=100&access_token=${pageAccessToken}`;
  while (next) {
    const videosRes = await fetch(next);
    const videosData = await videosRes.json();
    if (videosData.data) videos = videos.concat(videosData.data);
    next = videosData.paging?.next || null;
  }

  // Chuẩn bị object tổng hợp theo tháng
  const result: {
    [month: string]: { month: string; views: number; likes: number; comments: number; shares: number };
  } = {};

  // Khởi tạo các tháng trong khoảng thời gian
  const start = new Date(startTime);
  // Tăng endTime lên 2 ngày để bao phủ hết tháng cuối cùng
  var end = new Date(endTime);
  console.log(start);
  console.log(end);
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    const monthStr = format(current, "LLLL yyyy");
    result[monthStr] = { month: monthStr, views: 0, likes: 0, comments: 0, shares: 0 };
    current.setMonth(current.getMonth() + 1);
  }

  for (const video of videos) {
    const created = new Date(video.created_time);
    // Compare using start of day for startTime and end of day for endTime
    const createdDate = new Date(created.getFullYear(), created.getMonth(), created.getDate());
    const startDate = new Date(new Date(startTime).getFullYear(), new Date(startTime).getMonth(), new Date(startTime).getDate());
    const endDate = new Date(new Date(endTime).getFullYear(), new Date(endTime).getMonth(), new Date(endTime).getDate(), 23, 59, 59, 999);
    if (createdDate < startDate || createdDate > endDate) continue;
    const month = format(created, "LLLL yyyy");

    // Lấy views qua video_insights
    let views = 0;
    try {
      const insightsRes = await fetch(
        `https://graph.facebook.com/v23.0/${video.id}/video_insights?metric=total_video_views&access_token=${pageAccessToken}`
      );
      const insightsData = await insightsRes.json();
      const viewsMetric = insightsData.data?.find((m: any) => m.name === "total_video_views");
      if (viewsMetric && viewsMetric.values && viewsMetric.values[0]) {
        views = Number(viewsMetric.values[0].value) || 0;
      }
    } catch { }

    // Lấy likes
    let likes = 0;
    try {
      const likesRes = await fetch(
        `https://graph.facebook.com/v23.0/${video.id}/likes?summary=true&access_token=${pageAccessToken}`
      );
      const likesData = await likesRes.json();
      likes = likesData.summary?.total_count || 0;
    } catch { }

    // Lấy comments
    let comments = 0;
    try {
      const commentsRes = await fetch(
        `https://graph.facebook.com/v23.0/${video.id}/comments?summary=true&access_token=${pageAccessToken}`
      );
      const commentsData = await commentsRes.json();
      comments = commentsData.summary?.total_count || 0;
    } catch { }

    // Lấy shares (dùng sharedposts)
    let shares = 0;
    try {
      const sharesRes = await fetch(
        `https://graph.facebook.com/v23.0/${video.id}/crosspost_shared_pages?summary=true&access_token=${pageAccessToken}`
      );
      const sharesData = await sharesRes.json();
      shares = sharesData.summary?.total_count || 0;
    } catch { }

    // Cộng dồn vào tháng tương ứng
    if (!result[month]) {
      result[month] = { month, views: 0, likes: 0, comments: 0, shares: 0 };
    }
    result[month].views += views;
    result[month].likes += likes;
    result[month].comments += comments;
    result[month].shares += shares;
  }

  return Object.values(result)
}

export async function fetchVideoDetailStatsForPage(
  startTime?: string,
  endTime?: string
): Promise<
  { id: string; title: string; thumbnail: string; views: number; likes: number; comments: number; shares: number }[]
> {
  const accessToken = localStorage.getItem("fb_access_token");
  if (!accessToken) throw new Error("Access token not found. Please log in first.");

  // Lấy page access token và pageId như cũ
  const pagesRes = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}`
  );
  const pagesData = await pagesRes.json();
  const targetPage = pagesData.data.find((page: any) => page.name === PAGE_NAME);
  if (!targetPage) throw new Error("Page 'Create AI Video' not found in your managed pages.");
  const pageAccessToken = targetPage.access_token;
  const pageId = targetPage.id;

  // Lấy danh sách video
  let videos: any[] = [];
  let next = `https://graph.facebook.com/v23.0/${pageId}/videos?fields=id,title,thumbnails,created_time&limit=100&access_token=${pageAccessToken}`;
  while (next) {
    const videosRes = await fetch(next);
    const videosData = await videosRes.json();
    if (videosData.data) videos = videos.concat(videosData.data);
    next = videosData.paging?.next || null;
  }

  // Lọc video theo khoảng thời gian nếu có
  if (startTime && endTime) {
    videos = videos.filter((video) => {
      const created = new Date(video.created_time);
      // Compare using start of day for startTime and endTime
      const createdDate = new Date(created.getFullYear(), created.getMonth(), created.getDate());
      const startDate = new Date(new Date(startTime).getFullYear(), new Date(startTime).getMonth(), new Date(startTime).getDate());
      const endDate = new Date(new Date(endTime).getFullYear(), new Date(endTime).getMonth(), new Date(endTime).getDate(), 23, 59, 59, 999);
      return createdDate >= startDate && createdDate <= endDate;
    });
  }

  // Lấy insight từng video
  const result: {
    id: string;
    title: string;
    thumbnail: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }[] = [];

  for (const video of videos) {
    const id = video.id;
    const title = video.title || "Untitled";
    const thumbnail = video.thumbnails?.data?.[video.thumbnails?.data.length - 1]?.uri || "";

    // Views
    let views = 0;
    try {
      const insightsRes = await fetch(
        `https://graph.facebook.com/v23.0/${id}/video_insights?metric=total_video_views&access_token=${pageAccessToken}`
      );
      const insightsData = await insightsRes.json();
      const viewsMetric = insightsData.data?.find((m: any) => m.name === "total_video_views");
      if (viewsMetric && viewsMetric.values && viewsMetric.values[0]) {
        views = Number(viewsMetric.values[0].value) || 0;
      }
    } catch { }

    // Likes
    let likes = 0;
    try {
      const likesRes = await fetch(
        `https://graph.facebook.com/v23.0/${id}/likes?summary=true&access_token=${pageAccessToken}`
      );
      const likesData = await likesRes.json();
      likes = likesData.summary?.total_count || 0;
    } catch { }

    // Comments
    let comments = 0;
    try {
      const commentsRes = await fetch(
        `https://graph.facebook.com/v23.0/${id}/comments?summary=true&access_token=${pageAccessToken}`
      );
      const commentsData = await commentsRes.json();
      comments = commentsData.summary?.total_count || 0;
    } catch { }

    // Shares
    let shares = 0;
    try {
      const sharesRes = await fetch(
        `https://graph.facebook.com/v23.0/${id}/crosspost_shared_pages?summary=true&access_token=${pageAccessToken}`
      );
      const sharesData = await sharesRes.json();
      shares = sharesData.summary?.total_count || 0;
    } catch { }

    result.push({ id, title, thumbnail, views, likes, comments, shares });
  }

  return result;
}
