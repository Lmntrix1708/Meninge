// newsScript.js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.news-card').forEach(async card => {
    const link = card.querySelector('a.news-link');
    let iconUrl = '';
    try {
      const pageUrl = new URL(link.href);
      const fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(link.href)}`;
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error();
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // 1) collect all <link rel="icon" sizes="WxH">
      const icons = Array.from(
        doc.querySelectorAll('link[rel="icon"][sizes], link[rel="shortcut icon"][sizes]')
      ).map(el => {
        const sizes = el.getAttribute('sizes').split('x').map(n=>parseInt(n,10));
        return { href: el.getAttribute('href'), area: sizes[0]*sizes[1] };
      });

      if (icons.length) {
        // pick the one with the max area
        icons.sort((a,b) => b.area - a.area);
        iconUrl = new URL(icons[0].href, pageUrl.origin).href;
      }

      // 2) fallback to apple-touch-icon (high-res)
      if (!iconUrl) {
        const apple = doc.querySelector('link[rel="apple-touch-icon"][sizes]');
        if (apple) {
          iconUrl = new URL(apple.getAttribute('href'), pageUrl.origin).href;
        }
      }

      // 3) fallback to JSON-LD Organization logo
      if (!iconUrl) {
        doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
          try {
            const data = JSON.parse(s.textContent);
            const items = data["@graph"] || [data];
            items.forEach(item => {
              if (item["@type"] === "Organization" && item.logo) iconUrl = item.logo;
            });
          } catch {}
        });
      }

      // 4) fallback to og:image
      if (!iconUrl) {
        const og = doc.querySelector('meta[property="og:image"]');
        if (og) iconUrl = og.content;
      }

      // 5) ultimate fallback: Clearbit
      if (!iconUrl) {
        iconUrl = `https://logo.clearbit.com/${pageUrl.hostname}?size=120`;
      }

      // Insert the logo
      const img = document.createElement('img');
      img.src = iconUrl;
      img.alt = pageUrl.hostname + ' logo';
      img.className = 'news-logo';
      card.insertBefore(img, link);

      // Fetch & truncate title
      let title =
        doc.querySelector('meta[property="og:title"]')?.content?.trim() ||
        doc.querySelector('title')?.innerText?.trim() ||
        link.textContent;
      if (title.length > 50) title = title.slice(0,47) + '...';
      link.textContent = title;
    } catch (e) {
      console.warn('Logo/title load failed for', link.href, e);
    }
  });
});
