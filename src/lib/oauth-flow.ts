export function connectToFacebook(clientId: string, onSuccess: (user: { name: string, avatar: string }) => void) {
  if (!clientId) {
    alert("Facebook App ID is missing");
    return;
  }
  // Lấy URL root (ví dụ: https://quickclipshare.loca.lt/share)
  const redirectUri = encodeURIComponent(window.location.origin + "/share");
  const authUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,read_insights`;

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

      // So sánh với URL root + "/share"
      if (url.startsWith(window.location.origin + "/share")) {
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

export function connectToYouTube(clientId: string, onSuccess: (user: { name: string, avatar: string }) => void) {
  if (!clientId) {
    alert("Google Client ID is missing");
    return;
  }
  const redirectUri = encodeURIComponent(window.location.href);
  const scope = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "profile",
    "email"
  ].join(" ");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${encodeURIComponent(scope)}`;

  const width = 700, height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 5;

  const popup = window.open(
    authUrl,
    "YouTube Login",
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

      // Khi popup đã redirect về redirect_uri
      if (url.startsWith(window.location.origin)) {
        const params = new URLSearchParams(hash.substring(1) || search);

        if (params.get("error")) {
          console.warn("User denied permissions.");
          popup.close();
          clearInterval(interval);
          return;
        }

        if (params.get("access_token")) {
          const accessToken = params.get("access_token")!;
          popup.close();
          clearInterval(interval);

          // Lấy thông tin user từ Google People API
          fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`)
            .then(res => res.json())
            .then(data => {
              // Save to localStorage
              localStorage.setItem("yt_access_token", accessToken);
              localStorage.setItem("yt_user_name", data.name);
              localStorage.setItem("yt_user_avatar", data.picture || "");

              onSuccess({
                name: data.name,
                avatar: data.picture || ""
              });
            })
            .catch(err => {
              console.error("Error fetching YouTube user data:", err);
            });
        }
      }
    } catch (e) {
      // Ignore cross-origin errors until popup is on same origin
    }
  }, 500);
}

export function connectToTiktok(clientKey: string, onSuccess: (user: { name: string, avatar: string }) => void) {
  if (!clientKey) {
    alert("TikTok Client Key is missing");
    return;
  }
  const redirectUri = encodeURIComponent(window.location.href);
  const scope = [
    "user.info.basic",
    "user.info.profile", 
    "user.info.stats",
    "video.list", 
    "video.publish", 
    "video.upload",
    "artist.certification.read", 
    "artist.certification.update", 
  ].join(",");
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scope)}`;

  const width = 700, height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 5;

  const popup = window.open(
    authUrl,
    "TikTok Login",
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
      const search = popup.location.search;

      // Khi popup đã redirect về redirect_uri
      if (url.startsWith(window.location.origin)) {
        const params = new URLSearchParams(search);

        if (params.get("error")) {
          popup.close();
          clearInterval(interval);
          return;
        }

        if (params.get("code")) {
          const code = params.get("code")!;
          popup.close();
          clearInterval(interval);

          // Gửi code về backend để đổi lấy access_token
          fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/tiktok/exchange_token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, redirect_uri: window.location.href })
          })
            .then(res => res.json())
            .then(data => {
              // data phải chứa access_token, user info...
              localStorage.setItem("tt_access_token", data.access_token);
              localStorage.setItem("tt_user_name", data.name);
              localStorage.setItem("tt_user_avatar", data.avatar);

              onSuccess({
                name: data.name,
                avatar: data.avatar
              });
            })
            .catch(err => {
              console.error("Error exchanging TikTok code:", err);
            });
        }
      }
    } catch (e) {
      // Ignore cross-origin errors until popup is on same origin
    }
  }, 500);
}

