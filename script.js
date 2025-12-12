(function () {
  const owner = "Lumi-VRC";
  const repo = "Club-Maul-Website";
  const branch = "main";
  const imageDir = "img/mainpage/bg1";
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${imageDir}?ref=${branch}`;
  const swapMs = 5000;
  const heroA = document.querySelector(".page-bg-a");
  const heroB = document.querySelector(".page-bg-b");

  if (!heroA || !heroB) return;

  const toSiteUrl = (path) => `${window.location.origin}/${path}`;
  const toRawUrl = (path) =>
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

  const fetchImages = async () => {
    try {
      const res = await fetch(apiUrl, {
        headers: { Accept: "application/vnd.github.v3+json" },
      });
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const data = await res.json();
      return data
        .filter(
          (item) =>
            item.type === "file" &&
            /\.(png|jpe?g|gif|webp|avif)$/i.test(item.name)
        )
        .map((item) => ({
          site: toSiteUrl(item.path),
          raw: toRawUrl(item.path),
        }));
    } catch (err) {
      console.warn("Could not load hero images", err);
      return [];
    }
  };

  const preload = (entries) =>
    Promise.all(
      entries.map(
        (entry) =>
          new Promise((resolve) => {
            const tryRaw = () => {
              const imgRaw = new Image();
              imgRaw.crossOrigin = "anonymous";
              imgRaw.onload = () => resolve(entry.raw);
              imgRaw.onerror = () => resolve(null);
              imgRaw.src = entry.raw;
            };
            const imgSite = new Image();
            imgSite.crossOrigin = "anonymous";
            imgSite.onload = () => resolve(entry.site);
            imgSite.onerror = tryRaw;
            imgSite.src = entry.site;
          })
      )
    );

  const startRotation = (images) => {
    if (!images.length) return;

    let index = 0;
    let useA = true;

    const setBg = (el, url) => {
      el.style.backgroundImage = `url(${url})`;
    };

    setBg(heroA, images[0]);
    heroA.classList.remove("is-hidden");

    if (images.length === 1) return;

    setInterval(() => {
      index = (index + 1) % images.length;
      const incoming = useA ? heroB : heroA;
      const outgoing = useA ? heroA : heroB;
      setBg(incoming, images[index]);
      incoming.classList.remove("is-hidden");
      outgoing.classList.add("is-hidden");
      useA = !useA;
    }, swapMs);
  };

  (async () => {
    const images = await fetchImages();
    if (!images.length) {
      console.warn("No hero images found in", imageDir);
      return;
    }
    const usable = (await preload(images)).filter(Boolean);
    if (!usable.length) {
      console.warn("Hero images failed to load");
      return;
    }
    startRotation(usable);
  })();
})();

