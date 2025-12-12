(function () {
  const owner = "Lumi-VRC";
  const repo = "Club-Maul-Website";
  const branch = "main";

  const fetchImages = async (imageDir) => {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${imageDir}?ref=${branch}`;
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
      console.warn(`Could not load images from ${imageDir}`, err);
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
    // Fetch bg1 images for first hero
    const bg1Images = await fetchImages("img/mainpage/bg1");
    if (bg1Images.length) {
      await preload(bg1Images);
      window.clubmaulHeroImages = bg1Images;
      window.dispatchEvent(
        new CustomEvent("clubmaul:heroImagesReady", { detail: { images: bg1Images } })
      );
    }

    // Fetch bg2 images for hunts hero
    const bg2Images = await fetchImages("img/mainpage/bg2");
    if (bg2Images.length) {
      await preload(bg2Images);
      window.clubmaulHuntsImages = bg2Images;
      window.dispatchEvent(
        new CustomEvent("clubmaul:huntsImagesReady", { detail: { images: bg2Images } })
      );
    }
  })();
})();

