(function () {
  var header = document.getElementById("site-header");
  if (!header) return;

  var mqMobile = window.matchMedia("(max-width: 720px)");
  var mqReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var burger = document.querySelector(".nav-burger");

  /* Scroll position bands (px): top → utility hides → main hides; scrolling up reverses */
  var band1 = 36;
  var band2 = 104;
  var ticking = false;

  function measureShells() {
    var innerU = header.querySelector(".header-utility");
    var innerM = header.querySelector(".header-main");
    if (!innerU || !innerM) return;
    if (!mqMobile.matches) {
      header.style.removeProperty("--shell-utility-h");
      header.style.removeProperty("--shell-main-h");
      return;
    }
    header.style.setProperty("--shell-utility-h", innerU.scrollHeight + "px");
    header.style.setProperty("--shell-main-h", innerM.scrollHeight + "px");
  }

  function sync() {
    var y = window.scrollY;
    header.classList.toggle("site-header--scrolled", y > 32);

    var mobile = mqMobile.matches;
    var menuOpen = burger && burger.open;
    var reduce = mqReduceMotion.matches;

    header.classList.remove("site-header--m-collapse-1", "site-header--m-collapse-2");

    if (mobile && !reduce && !menuOpen) {
      measureShells();
      var phase = 0;
      if (y >= band2) phase = 2;
      else if (y >= band1) phase = 1;
      if (phase >= 1) header.classList.add("site-header--m-collapse-1");
      if (phase >= 2) header.classList.add("site-header--m-collapse-2");
    } else {
      measureShells();
    }
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

  var innerU = header.querySelector(".header-utility");
  var innerM = header.querySelector(".header-main");
  if (typeof ResizeObserver !== "undefined" && innerU && innerM) {
    var ro = new ResizeObserver(function () {
      measureShells();
    });
    ro.observe(innerU);
    ro.observe(innerM);
  }

  sync();
})();
