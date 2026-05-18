(function () {
  "use strict";

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var closeBtn = document.getElementById("lightboxClose");
  var prevBtn = document.getElementById("lightboxPrev");
  var nextBtn = document.getElementById("lightboxNext");
  var counterEl = document.getElementById("lightboxCounter");

  if (!lightbox || !lightboxImg || !closeBtn) return;

  var galleryState = null;

  function setNavVisible(show) {
    if (prevBtn) prevBtn.hidden = !show;
    if (nextBtn) nextBtn.hidden = !show;
    if (counterEl) counterEl.hidden = !show;
  }

  function showSlide(index) {
    if (!galleryState || !galleryState.links.length) return;
    var total = galleryState.links.length;
    var i = ((index % total) + total) % total;
    galleryState.index = i;
    var link = galleryState.links[i];
    var image = link.querySelector("img");
    lightboxImg.src = link.getAttribute("href") || (image && image.src) || "";
    lightboxImg.alt = image ? image.getAttribute("alt") || "" : "";
    if (counterEl) counterEl.textContent = i + 1 + " / " + total;
  }

  function openLightbox() {
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function openSingle(link) {
    galleryState = null;
    setNavVisible(false);
    var image = link.querySelector("img");
    lightboxImg.src = link.getAttribute("href") || (image && image.src) || "";
    lightboxImg.alt = image ? image.getAttribute("alt") || "" : "";
    openLightbox();
  }

  function openGroup(groupName, clickedLink) {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('[data-lightbox-group="' + groupName + '"]')
    );
    if (!links.length) return;
    var index = links.indexOf(clickedLink);
    if (index < 0) index = 0;
    galleryState = { links: links, index: index };
    setNavVisible(links.length > 1);
    showSlide(index);
    openLightbox();
  }

  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    galleryState = null;
    setNavVisible(false);
    document.body.style.overflow = "";
  }

  function step(delta) {
    if (!galleryState) return;
    showSlide(galleryState.index + delta);
  }

  function bindZoomLink(link) {
    if (link.dataset.lightboxBound === "1") return;
    link.dataset.lightboxBound = "1";
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var group = link.getAttribute("data-lightbox-group");
      if (group) openGroup(group, link);
      else openSingle(link);
    });
  }

  function initMaterialItemZoom() {
    document.querySelectorAll(".material-item__media").forEach(function (media) {
      var zoomLinks = media.querySelectorAll("a.material-item__zoom");
      if (zoomLinks.length) {
        zoomLinks.forEach(bindZoomLink);
        return;
      }

      var thumb = media.querySelector("img");
      if (!thumb || !thumb.getAttribute("src")) return;

      var item = media.closest(".material-item");
      var titleEl = item && item.querySelector(".material-item__title");
      var title = titleEl ? titleEl.textContent.trim() : "";
      var alt = thumb.getAttribute("alt") || title;
      if (!thumb.getAttribute("alt") && alt) thumb.setAttribute("alt", alt);

      var link = document.createElement("a");
      link.href = thumb.getAttribute("src");
      link.className = "material-item__zoom";
      link.setAttribute("aria-label", title ? "View larger: " + title : "View larger image");
      media.insertBefore(link, thumb);
      link.appendChild(thumb);
      bindZoomLink(link);
    });
  }

  initMaterialItemZoom();

  document.querySelectorAll(".gallery a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var group = a.getAttribute("data-lightbox-group");
      if (group) openGroup(group, a);
      else openSingle(a);
    });
  });

  closeBtn.addEventListener("click", close);
  if (prevBtn) prevBtn.addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function (e) { e.stopPropagation(); step(1); });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (galleryState && e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
    if (galleryState && e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  });
})();
