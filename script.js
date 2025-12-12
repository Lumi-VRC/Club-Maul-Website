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
        .map((item) =>
          item.download_url.includes("?")
            ? `${item.download_url}&raw=1`
            : `${item.download_url}?raw=1`
        );
    } catch (err) {
      console.warn("Could not load hero images", err);
      return [];
    }
  };

  const preload = (urls) =>
    Promise.all(
      urls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = img.onerror = () => resolve();
            img.src = url;
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
    if (!images.length) return;
    await preload(images);
    startRotation(images);
  })();
})();

