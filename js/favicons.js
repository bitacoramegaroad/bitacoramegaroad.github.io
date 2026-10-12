(() => {
  const processed = new WeakSet();
  const faviconService = "https://www.google.com/s2/favicons";

  function setupFavicon(link) {
    if (processed.has(link) || !link.href) return;
    const label = link.querySelector("span");
    if (!label) return;

    let pageUrl;
    try {
      pageUrl = new URL(link.href);
    } catch {
      return;
    }
    if (!/^https?:$/.test(pageUrl.protocol)) return;

    processed.add(link);
    const icon = document.createElement("img");
    icon.className = "sidebar-interest-favicon";
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    icon.width = 20;
    icon.height = 20;
    icon.loading = "lazy";
    icon.decoding = "async";

    let triedDirectIcon = false;
    icon.addEventListener("error", () => {
      if (triedDirectIcon) {
        icon.remove();
        return;
      }
      triedDirectIcon = true;
      icon.src = new URL("/favicon.ico", pageUrl.origin).href;
    });

    const request = new URL(faviconService);
    request.searchParams.set("domain_url", pageUrl.href);
    request.searchParams.set("sz", "64");
    request.searchParams.set("alt", "404");
    icon.src = request.href;
    link.insertBefore(icon, label);
  }

  function scan(root) {
    if (root instanceof Element && root.matches(".sidebar-interest-list a")) setupFavicon(root);
    root.querySelectorAll?.(".sidebar-interest-list a").forEach(setupFavicon);
  }

  function start() {
    scan(document);
    if (!document.body) return;
    new MutationObserver((changes) => {
      changes.forEach((change) => change.addedNodes.forEach((node) => {
        if (node instanceof Element) scan(node);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
