(function () {
  var header = document.getElementById("site-header");
  if (!header) return;
  function sync() {
    header.classList.toggle("site-header--scrolled", window.scrollY > 32);
  }
  window.addEventListener("scroll", sync, { passive: true });
  sync();
})();
