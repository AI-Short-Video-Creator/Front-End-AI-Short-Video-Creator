export async function fetchTotalVideoViewsForPage(): Promise<number> {
  const accessToken = localStorage.getItem("fb_access_token");
  if (!accessToken) {
    throw new Error("Access token not found. Please log in first.");
  }

  const pagesRes = await fetch(`https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  const targetPage = pagesData.data.find((page: any) => page.name === "Create AI Video");

  if (!targetPage) {
    throw new Error("Page 'Create AI Video' not found in your managed pages.");
  }

  const pageAccessToken = targetPage.access_token;
  const pageId = targetPage.id;

  let totalViews = 0;
  let next = `https://graph.facebook.com/v23.0/${pageId}/posts?fields=id,message,created_time,attachments{media_type,media},insights.metric(total_video_impressions,total_video_views)&limit=25&access_token=${pageAccessToken}`;

  while (next) {
    const res = await fetch(next);
    const data = await res.json();

    for (const post of data.data) {
      const isVideoPost = post.attachments?.data?.some((a: any) => a.media_type === "video");
      if (isVideoPost && post.insights) {
        const viewsMetric = post.insights.data.find((m: any) => m.name === "total_video_views");
        if (viewsMetric) {
          totalViews += parseInt(viewsMetric.values?.[0]?.value || "0");
        }
      }
    }

    next = data.paging?.next || null;
  }

  console.log("Fetch succeeded. Total video views:", totalViews);

  return totalViews;
}

// Usage example:
(async () => {
  try {
    const result = await fetchTotalVideoViewsForPage();
    console.log("Fetch succeeded. Total video views:", result);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
})();
