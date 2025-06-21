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
