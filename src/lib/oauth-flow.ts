export function connectToFacebook(clientId: string, onSuccess: (user: { name: string, avatar: string }) => void) {
  if (!clientId) {
    alert("Facebook App ID is missing");
    return;
  }
  const redirectUri = encodeURIComponent(window.location.href);
  const authUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts`;

  const width = 700, height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 5;

  const popup = window.open(
    authUrl,
    "Facebook Login",
    `width=${width},height=${height},left=${left},top=${top}`
  );

  if (!popup) {
    alert("Popup blocked. Please allow it in your browser.");
    return;
  }

  const interval = setInterval(() => {
    try {
      if (!popup || popup.closed) {
        clearInterval(interval);
        return;
      }

      const url = popup.location.href;
      const hash = popup.location.hash;
      const search = popup.location.search;

      // Khi popup đã redirect về redirect_uri (localhost:8081/share)
      if (url.startsWith("http://localhost:8081/share")) {
        const params = new URLSearchParams(hash.substring(1) || search);

        if (params.get("error") === "access_denied") {
          console.warn("User denied permissions.");
          popup.close();
          clearInterval(interval);
          return;
        }

        if (params.get("access_token")) {
          const accessToken = params.get("access_token")!;
          popup.close();
          clearInterval(interval);

          fetch(`https://graph.facebook.com/me?fields=name,picture&access_token=${accessToken}`)
            .then(res => res.json())
            .then(data => {
              // Save to localStorage
              localStorage.setItem("fb_access_token", accessToken);
              localStorage.setItem("fb_user_name", data.name);
              localStorage.setItem("fb_user_avatar", data.picture?.data?.url || "");

              onSuccess({
                name: data.name,
                avatar: data.picture?.data?.url || ""
              });
            })
            .catch(err => {
              console.error("Error fetching Facebook user data:", err);
            });
        }
      }
    } catch (e) {
      // Ignore cross-origin errors until popup is on same origin
    }
  }, 500);
}

export async function fetchTotalVideoViewsForPage(): Promise<number> {
  const accessToken = localStorage.getItem("fb_access_token");
  if (!accessToken) {
    throw new Error("Access token not found. Please log in first.");
  }

  // 1. Lấy danh sách các Page user đang quản lý
  const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  const targetPage = pagesData.data.find((page: any) => page.name === "Create AI Video");

  if (!targetPage) {
    throw new Error("Page 'Create AI Video' not found in your managed pages.");
  }

  const pageAccessToken = targetPage.access_token;
  const pageId = targetPage.id;

  let totalViews = 0;
  let next = `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time,attachments{media_type,media},insights.metric(total_video_impressions,total_video_views)&limit=25&access_token=${pageAccessToken}`;

  // 2. Lặp qua các post có video và cộng tổng lượt xem
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

  return totalViews;
}
