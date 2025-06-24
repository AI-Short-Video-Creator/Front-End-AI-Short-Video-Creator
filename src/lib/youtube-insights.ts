import { format } from "date-fns";

/**
 * Lấy tổng lượt xem của tất cả video đã đăng trên một kênh YouTube theo tên kênh.
 * Yêu cầu: access token đã lưu ở localStorage với key "yt_access_token"
 * @param channelName - Tên kênh YouTube (ví dụ: "QuickClip Creator")
 * @returns Tổng lượt xem (number)
 */
export async function fetchTotalYouTubeViewsByOwnerChannel(channelInput: string): Promise<number> {
  const accessToken = localStorage.getItem("yt_access_token");
  if (!accessToken) throw new Error("YouTube access token not found. Please log in first.");

  let channelId: string | undefined;

  // Nếu truyền vào là handle (bắt đầu bằng @)
  if (channelInput.startsWith("@")) {
    // Gọi search API để lấy channelId từ handle
    const handle = channelInput.replace(/^@/, "");
    const searchByHandleRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&access_token=${accessToken}`
    );
    const searchByHandleData = await searchByHandleRes.json();
    channelId = searchByHandleData.items?.[0]?.id?.channelId;
  }

  // Nếu không phải handle, thử lấy bằng forUsername (username cũ)
  if (!channelId) {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(channelInput)}&access_token=${accessToken}`
    );
    const searchData = await searchRes.json();
    channelId = searchData.items?.[0]?.id;
  }

  // Nếu vẫn chưa có, thử search bằng tên kênh
  if (!channelId) {
    const searchByNameRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelInput)}&access_token=${accessToken}`
    );
    const searchByNameData = await searchByNameRes.json();
    channelId = searchByNameData.items?.[0]?.id?.channelId;
  }

  if (!channelId) throw new Error("Channel not found.");

  // Lấy danh sách videoId của channel
  let nextPageToken: string | undefined = undefined;
  let totalViews = 0;
  do {
    const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet,id&channelId=${channelId}&maxResults=50&type=video${pageTokenParam}&access_token=${accessToken}`
    );
    const videosData = await videosRes.json();
    const videoIds = videosData.items.map((item: any) => item.id.videoId).filter(Boolean);

    // In ra thông tin từng video
    videosData.items.forEach((item: any, idx: number) => {
      console.log(`Video #${idx + 1}:`, item);
    });

    if (videoIds.length > 0) {
      // Lấy statistics cho các video này
      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(",")}&access_token=${accessToken}`
      );
      const statsData = await statsRes.json();
      for (const video of statsData.items) {
        totalViews += Number(video.statistics?.viewCount || 0);
      }
    }

    nextPageToken = videosData.nextPageToken;
  } while (nextPageToken);

  return totalViews;
}

/**
 * Gửi video và thumbnail về backend để backend upload lên YouTube
 * @param videoUrl - Link chứa video (mp4, mov, ...)
 * @param title - Tiêu đề video
 * @param description - Mô tả video
 * @param thumbnailUrl - Link ảnh thumbnail (jpg, png, ...)
 * @returns Thông tin video đã upload từ backend trả về
 */
export async function uploadVideoToYouTubeViaBackend(
  videoUrl: string,
  title: string,
  description: string,
  thumbnailUrl?: string
): Promise<any> {
  // Gửi thông tin lên backend (ví dụ endpoint /api/youtube/upload)
  const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/youtube/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Nếu cần xác thực, thêm Authorization header ở đây
    },
    body: JSON.stringify({
      videoUrl,
      title,
      description,
      thumbnailUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Failed to upload video via backend.");
  }

  return await res.json(); // backend trả về { videoId, videoUrl, thumbnail, title, description }
}

/**
 * Lấy tổng views, likes, comments của tất cả video trên kênh YouTube theo từng tháng
 * @param startTime ISO string (ví dụ: "2024-01-01")
 * @param endTime ISO string (ví dụ: "2024-06-30")
 * @returns Array<{ month: string, views: number, likes: number, comments: number }>
 */
export async function fetchMonthlyYouTubeVideoStats(
  startTime: string,
  endTime: string,
  channelInput: string
): Promise<{ month: string; views: number; likes: number; comments: number }[]> {
  const accessToken = localStorage.getItem("yt_access_token");
  if (!accessToken) throw new Error("YouTube access token not found. Please log in first.");

  // Lấy channelId như hàm fetchTotalYouTubeViewsByOwnerChannel
  let channelId: string | undefined = await getChannelId(channelInput, accessToken);
  if (!channelId) throw new Error("Channel not found.");

  // Lấy danh sách video trong khoảng thời gian
  let nextPageToken: string | undefined = undefined;
  let videos: any[] = [];
  do {
    const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet,id&channelId=${channelId}&maxResults=50&type=video${pageTokenParam}&access_token=${accessToken}`
    );
    const videosData = await videosRes.json();
    videos = videos.concat(
      videosData.items.filter((item: any) => {
        const created = new Date(item.snippet.publishedAt);
        // So sánh từ đầu ngày startTime đến cuối ngày endTime
        const start = new Date(startTime);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endTime);
        end.setHours(23, 59, 59, 999);
        return created >= start && created <= end;
      })
    );
    nextPageToken = videosData.nextPageToken;
  } while (nextPageToken);

  // Khởi tạo các tháng trong khoảng thời gian
  const result: {
    [month: string]: { month: string; views: number; likes: number; comments: number };
  } = {};
  let current = new Date(startTime);
  const end = new Date(endTime);
  while (current <= end) {
    const monthStr = format(current, "LLLL yyyy");
    result[monthStr] = { month: monthStr, views: 0, likes: 0, comments: 0 };
    current.setMonth(current.getMonth() + 1);
  }

  // Lấy statistics từng video và cộng vào tháng
  for (let i = 0; i < videos.length; i += 50) {
    const batch = videos.slice(i, i + 50);
    const ids = batch.map((v) => v.id.videoId).join(",");
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&access_token=${accessToken}`
    );
    const statsData = await statsRes.json();
    for (const video of statsData.items) {
      const created = new Date(video.snippet.publishedAt);
      const month = format(created, "LLLL yyyy");
      result[month].views += Number(video.statistics?.viewCount || 0);
      result[month].likes += Number(video.statistics?.likeCount || 0);
      result[month].comments += Number(video.statistics?.commentCount || 0);
    }
  }

  // Trả về mảng đã sắp xếp theo thời gian, chỉ lấy 3 tháng cuối
  return Object.values(result)
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-3);
}

/**
 * Lấy danh sách video chi tiết cho table data (id, title, thumbnail, views, likes, comments)
 */
export async function fetchYouTubeVideoDetailStats(
  startTime: string,
  endTime: string,
  channelInput: string
): Promise<
  { id: string; title: string; thumbnail: string; views: number; likes: number; comments: number }[]
> {
  const accessToken = localStorage.getItem("yt_access_token");
  if (!accessToken) throw new Error("YouTube access token not found. Please log in first.");

  let channelId: string | undefined = await getChannelId(channelInput, accessToken);
  if (!channelId) throw new Error("Channel not found.");

  // Lấy danh sách video trong khoảng thời gian
  let nextPageToken: string | undefined = undefined;
  let videos: any[] = [];
  do {
    const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet,id&channelId=${channelId}&maxResults=50&type=video${pageTokenParam}&access_token=${accessToken}`
    );
    const videosData = await videosRes.json();
    videos = videos.concat(
      videosData.items.filter((item: any) => {
        const created = new Date(item.snippet.publishedAt);
        // So sánh từ đầu ngày startTime đến cuối ngày endTime
        const start = new Date(startTime);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endTime);
        end.setHours(23, 59, 59, 999);
        return created >= start && created <= end;
      })
    );
    nextPageToken = videosData.nextPageToken;
  } while (nextPageToken);

  // Lấy statistics từng video
  const result: {
    id: string;
    title: string;
    thumbnail: string;
    views: number;
    likes: number;
    comments: number;
  }[] = [];

  for (let i = 0; i < videos.length; i += 50) {
    const batch = videos.slice(i, i + 50);
    const ids = batch.map((v) => v.id.videoId).join(",");
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&access_token=${accessToken}`
    );
    const statsData = await statsRes.json();
    for (const video of statsData.items) {
      result.push({
        id: video.id,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails?.high?.url || "",
        views: Number(video.statistics?.viewCount || 0),
        likes: Number(video.statistics?.likeCount || 0),
        comments: Number(video.statistics?.commentCount || 0),
      });
    }
  }

  return result;
}

/**
 * Hàm phụ trợ lấy channelId từ channelInput (handle, username, tên kênh)
 */
async function getChannelId(channelInput: string, accessToken: string): Promise<string | undefined> {
  let channelId: string | undefined;

  if (channelInput.startsWith("@")) {
    const handle = channelInput.replace(/^@/, "");
    const searchByHandleRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&access_token=${accessToken}`
    );
    const searchByHandleData = await searchByHandleRes.json();
    channelId = searchByHandleData.items?.[0]?.id?.channelId;
  }

  if (!channelId) {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(channelInput)}&access_token=${accessToken}`
    );
    const searchData = await searchRes.json();
    channelId = searchData.items?.[0]?.id;
  }

  if (!channelId) {
    const searchByNameRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelInput)}&access_token=${accessToken}`
    );
    const searchByNameData = await searchByNameRes.json();
    channelId = searchByNameData.items?.[0]?.id?.channelId;
  }

  return channelId;
}
