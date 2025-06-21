import { format } from "date-fns";

export async function fetchTotalVideoViewsForPage(): Promise<number> {
  const accessToken = localStorage.getItem("fb_access_token");
  if (!accessToken) {
    throw new Error("Access token not found. Please log in first.");
  }

  // Lấy page access token và pageId như cũ
  const pagesRes = await fetch(`https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  const targetPage = pagesData.data.find((page: any) => page.name === "Create AI Video");
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
 * Post a new video post to the Facebook page "Create AI Video"
 * @param videoUrl - The public URL of the video file
 * @param title - The title of the post
 * @param caption - The caption/description of the post
 */
export async function postVideoToPage(videoUrl: string, title: string, caption: string): Promise<any> {
  const accessToken = localStorage.getItem("fb_access_token");
  if (!accessToken) {
    throw new Error("Access token not found. Please log in first.");
  }

  // Get the page access token and page ID
  const pagesRes = await fetch(`https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  const targetPage = pagesData.data.find((page: any) => page.name === "Create AI Video");

  if (!targetPage) {
    throw new Error("Page 'Create AI Video' not found in your managed pages.");
  }

  const pageAccessToken = targetPage.access_token;
  const pageId = targetPage.id;

  // Post the video to the page
  const formData = new FormData();
  formData.append("file_url", videoUrl); // public video URL
  formData.append("title", title);
  formData.append("description", caption);
  formData.append("access_token", pageAccessToken);

  // Facebook Graph API endpoint for uploading video to a page
  const uploadRes = await fetch(`https://graph.facebook.com/v23.0/${pageId}/videos`, {
    method: "POST",
    body: formData,
  });

  const uploadData = await uploadRes.json();

  if (!uploadRes.ok) {
    throw new Error(uploadData.error?.message || "Failed to post video to Facebook page.");
  }

  return uploadData; // contains video_id and other info
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
  const targetPage = pagesData.data.find((page: any) => page.name === "Create AI Video");
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
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    const monthStr = format(current, "LLLL yyyy");
    result[monthStr] = { month: monthStr, views: 0, likes: 0, comments: 0, shares: 0 };
    current.setMonth(current.getMonth() + 1);
  }
  
  end = new Date(new Date(endTime).getTime() + 2 * 24 * 60 * 60 * 1000);

  for (const video of videos) {
    const created = new Date(video.created_time);
    if (created < new Date(startTime) || created > new Date(end)) continue;
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

  // Trả về mảng đã sắp xếp theo thời gian, chỉ lấy các tháng >= startTime
  const sorted = Object.values(result)
    .filter(item => {
      const itemDate = new Date(item.month);
      const startDate = new Date(format(new Date(startTime), "LLLL yyyy"));
      return itemDate >= startDate;
    })
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  return sorted.slice(-3);
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
  const targetPage = pagesData.data.find((page: any) => page.name === "Create AI Video");
  if (!targetPage) throw new Error("Page 'Create AI Video' not found in your managed pages.");
  const pageAccessToken = targetPage.access_token;
  const pageId = targetPage.id;
  const end = new Date(new Date(endTime).getTime() + 2 * 24 * 60 * 60 * 1000);


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
  if (startTime && end) {
    videos = videos.filter((video) => {
      const created = new Date(video.created_time);
      return created >= new Date(startTime) && created <= new Date(end);
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
