(() => {
  const $ = selector => document.querySelector(selector);
  const status = $("#payment-status");
  const error = $("#payment-error");
  const downloadList = $("#download-list");
  const config = window.ALIBABA_SUPABASE_CONFIG;
  const sessionId = new URLSearchParams(location.search).get("session_id");

  async function prepareDownloads() {
    if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId || "")) {
      throw new Error("This page needs the checkout session link from Stripe. Open the payment confirmation link again to retrieve your downloads.");
    }
    if (!config || typeof config.url !== "string" || typeof config.publishableKey !== "string" || config.publishableKey.length < 20) {
      throw new Error("The marketplace backend is not configured. Contact the site owner for help with your paid order.");
    }

    const endpoint = `${config.url.replace(/\/$/, "")}/functions/v1/get-paid-downloads`;
    let lastMessage = "Your payment is still being verified. Please wait a moment and refresh this page.";
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {"apikey": config.publishableKey, "Content-Type": "application/json"},
        body: JSON.stringify({session_id: sessionId}),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(result.downloads)) {
        if (!result.downloads.length) throw new Error("No downloads were attached to this paid order. Contact the site owner for help.");
        downloadList.replaceChildren(...result.downloads.map(item => {
          const row = document.createElement("div");
          row.className = "paid-download";
          const title = document.createElement("strong");
          title.textContent = item.title;
          const link = document.createElement("a");
          const downloadUrl = new URL(item.url);
          const supabaseOrigin = new URL(config.url).origin;
          const localDownload = location.hostname === "localhost" || location.hostname === "127.0.0.1";
          const secureProtocol = downloadUrl.protocol === "https:" || (localDownload && downloadUrl.protocol === "http:");
          if (!secureProtocol || downloadUrl.origin !== supabaseOrigin) {
            throw new Error("A secure download link could not be verified. Contact the site owner for help.");
          }
          link.href = downloadUrl.href;
          link.textContent = `Download ${item.file_name}`;
          link.rel = "noopener";
          row.append(title, link);
          return row;
        }));
        try {
          localStorage.removeItem("ac-cart");
        } catch (storageError) {
          console.warn("Could not clear the saved cart after checkout.", storageError);
        }
        status.textContent = "Your payment was confirmed. Download your files below; each secure link expires after five minutes.";
        return;
      }
      lastMessage = typeof result.error === "string" ? result.error : lastMessage;
      if (response.status !== 503 || attempt === 4) break;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    throw new Error(lastMessage);
  }

  prepareDownloads().catch(cause => {
    status.textContent = "Your payment confirmation could not be completed on this page.";
    error.textContent = cause instanceof Error ? cause.message : "Please contact the site owner for help with your order.";
    error.classList.remove("hidden");
  });
})();
