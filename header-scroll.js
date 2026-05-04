(function () {
  var header = document.getElementById("site-header");
  if (!header) return;

  function sync() {
    var y = window.scrollY;
    header.classList.toggle("site-header--scrolled", y > 32);
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        sync();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", sync, { passive: true });
  sync();
})();
