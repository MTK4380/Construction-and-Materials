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

  /* Home: sticky "Shop by category" — color when the bar is pinned (mobile) */
  var stickyHead = document.querySelector(".home-shop-sticky-head");
  var stickySentinel = document.querySelector(".home-shop-sentinel");
  if (stickyHead && stickySentinel && typeof IntersectionObserver !== "undefined") {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          stickyHead.classList.toggle("is-stuck", !e.isIntersecting);
        });
      },
      { threshold: [0] }
    );
    io.observe(stickySentinel);
  }
})();
