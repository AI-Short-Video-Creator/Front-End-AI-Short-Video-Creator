export function connectToFacebook(clientId: string, onSuccess: (user: { name: string, avatar: string }) => void) {
  if (!clientId) {
    alert("Facebook App ID is missing");
    return;
  }
  const redirectUri = encodeURIComponent(window.location.href);
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

