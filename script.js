(function () {
  const owner = "Lumi-VRC";
  const repo = "Club-Maul-Website";
  const branch = "main";
  const imageDir = "img/mainpage/bg1";
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${imageDir}?ref=${branch}`;

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

  (async () => {
    const images = await fetchImages();
    if (!images.length) return;
    await preload(images);
    window.clubmaulHeroImages = images;
    window.dispatchEvent(
      new CustomEvent("clubmaul:heroImagesReady", { detail: { images } })
    );
  })();
})();

