(() => {
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");

  if (!lightbox || !img || !closeBtn) return;

  const open = (src, alt) => {
    img.src = src;
    img.alt = alt || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    img.src = "";
    document.body.style.overflow = "";
  };

  document.querySelectorAll(".gallery a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const image = a.querySelector("img");
      open(a.getAttribute("href"), image?.getAttribute("alt"));
    });
  });

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
