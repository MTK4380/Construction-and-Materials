(function () {
  var header = document.getElementById("site-header");
  if (!header) return;

  var mqMobile = window.matchMedia("(max-width: 720px)");
  var mqReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var burger = document.querySelector(".nav-burger");
  var lastY = window.scrollY;
  var ticking = false;
  var deltaThreshold = 8;

  function sync() {
    var y = window.scrollY;
    header.classList.toggle("site-header--scrolled", y > 32);

    var mobile = mqMobile.matches;
    var menuOpen = burger && burger.open;
    var allowAutoHide = mobile && !mqReduceMotion.matches && !menuOpen;

    if (!allowAutoHide) {
      header.classList.remove("site-header--hidden");
      lastY = y;
      return;
    }

    if (y <= 20) {
      header.classList.remove("site-header--hidden");
    } else {
      var dy = y - lastY;
      if (dy > deltaThreshold) {
        header.classList.add("site-header--hidden");
      } else if (dy < -deltaThreshold) {
        header.classList.remove("site-header--hidden");
      }
    }
    lastY = y;
  }

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
  mqMobile.addEventListener("change", sync);
  mqReduceMotion.addEventListener("change", sync);
  if (burger) {
    burger.addEventListener("toggle", sync);
  }
  sync();
})();
