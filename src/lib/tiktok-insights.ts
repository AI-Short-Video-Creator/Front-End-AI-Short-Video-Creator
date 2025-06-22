import { format } from "date-fns";

/**
 * Upload video lên TikTok qua backend bằng URL video, title, description.
 * @param videoUrl URL file video (phải là link trực tiếp tới file .mp4)
 * @param title Tiêu đề video
 * @param description Mô tả video
 * @returns Promise<{ video_id: string }>
 */
export async function uploadVideoToTiktokByUrl(
  videoUrl: string,
  title: string,
  description: string
): Promise<{ video_id: string }> {
  const accessToken = localStorage.getItem("tt_access_token");
  if (!accessToken) throw new Error("TikTok access token not found. Please login first.");

  const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/tiktok/upload_video_by_url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      video_url: videoUrl,
      title,
      description,
      access_token: accessToken,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload to TikTok failed");
  }

  return res.json();
}

/**
 * Lấy tổng lượt xem của tất cả video trên kênh TikTok của user đã xác thực.
 * @returns Promise<{ totalViews: number }>
 */
export async function fetchTotalTiktokViews(): Promise<{ totalViews: number }> {
  const accessToken = localStorage.getItem("tt_access_token");
  if (!accessToken) throw new Error("TikTok access token not found. Please login first.");

  // Gọi backend để lấy tổng view (nên làm backend vì TikTok API không cho lấy toàn bộ video qua frontend)
  const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/tiktok/total_views`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Fetch TikTok total views failed");
  }

  return res.json();
}

/**
 * Lấy tổng lượt xem video TikTok theo từng tháng trong khoảng thời gian
 * @param startTime ISO string hoặc timestamp (ví dụ: "2024-01-01")
 * @param endTime ISO string hoặc timestamp (ví dụ: "2024-06-30")
 * @returns Array<{ month: string, views: number }>
 */
/**
 * Lấy tổng views, likes, comments, shares của tất cả video TikTok theo từng tháng
 */
export async function fetchMonthlyTiktokVideoStats(
  startTime: string,
  endTime: string
): Promise<
  { month: string; views: number; likes: number; comments: number; shares: number }[]
> {
  const accessToken = localStorage.getItem("tt_access_token");
  if (!accessToken) throw new Error("TikTok access token not found. Please login first.");

  const res = await fetch(
    `${import.meta.env.VITE_PUBLIC_API_URL}/tiktok/monthly_views?start=${startTime}&end=${endTime}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Fetch TikTok monthly video stats failed");
  }
  return res.json();
}

/**
 * Lấy danh sách video TikTok chi tiết cho table data (id, title, thumbnail, views, likes, comments, shares)
 * @param startTime ISO string hoặc timestamp (ví dụ: "2024-01-01")
 * @param endTime ISO string hoặc timestamp (ví dụ: "2024-06-30")
 * @returns Array<{ id, title, thumbnail, views, likes, comments, shares }>
 */
export async function fetchTiktokVideoDetailStats(
  startTime?: string,
  endTime?: string
): Promise<
  { id: string; title: string; thumbnail: string; views: number; likes: number; comments: number; shares: number }[]
> {
  const accessToken = localStorage.getItem("tt_access_token");
  if (!accessToken) throw new Error("TikTok access token not found. Please login first.");

  const params = [];
  if (startTime) params.push(`start=${startTime}`);
  if (endTime) params.push(`end=${endTime}`);
  const query = params.length ? `?${params.join("&")}` : "";

  const res = await fetch(
    `${import.meta.env.VITE_PUBLIC_API_URL}/tiktok/video_detail_stats${query}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Fetch TikTok video detail stats failed");
  }
  return res.json();
}