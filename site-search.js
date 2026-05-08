(function () {
  "use strict";

  var INDEX = [
    { label: "Home", url: "index.html", keys: "home marwat supplier islamabad rawalpindi building" },
    { label: "Construction materials", url: "products.html", keys: "materials catalog products shop building construction" },
    { label: "Shopping cart", url: "cart.html", keys: "cart basket list checkout saved shopping bag order lines add" },
    { label: "Sign in", url: "sign-in.html", keys: "sign in login log in password account username member portal" },
    { label: "Sign up", url: "sign-up.html", keys: "sign up register signup create account join new user" },
    { label: "Cement", url: "products.html#cement", keys: "cement opc ppc maple dg lucky bestway concrete grey white bag 53 grade" },
    { label: "Steel & iron", url: "products.html#steel", keys: "steel iron rods bars rebar sarya structural amreli ittefaq mughal" },
    { label: "Sand & crush", url: "products.html#sand", keys: "sand crush aggregate margalla sargodha chenab plaster concrete" },
    { label: "Bricks & blocks", url: "products.html#bricks", keys: "bricks blocks masonry aac fly ash clay" },
    { label: "Gravel & aggregate", url: "products.html#gravel", keys: "gravel ballast aggregate drainage screened" },
    { label: "Tiles & marbles", url: "products.html#tiles-marbles", keys: "tiles marble ceramic porcelain vitrified flooring cladding finishes" },
    { label: "Plumbing accessories", url: "products.html#plumbing", keys: "plumbing valves tape sealant cpvc fittings sanitary master sonex" },
    { label: "General supplies", url: "products.html#general", keys: "general supplies finishing accessories" },
    { label: "Services", url: "services.html", keys: "services delivery bulk contractor cement supply sand crush steel orders" },
    { label: "Get a quote", url: "get-quote.html", keys: "quote pricing estimate request whatsapp form list" },
    { label: "Contact us", url: "contact.html", keys: "contact phone email address map location japan road islamabad" },
    { label: "About us", url: "about.html", keys: "about company who we are resources marwat" },
    { label: "Signature shop", url: "gallery.html", keys: "gallery photos pictures shop signature deliveries portfolio" },
  ];

  function scoreEntry(q, entry) {
    var query = (q || "").trim().toLowerCase();
    if (!query) return 0;
    var hay = (entry.label + " " + entry.keys).toLowerCase();
    var words = query.split(/\s+/).filter(Boolean);
    var s = 0;
    var i;
    for (i = 0; i < words.length; i++) {
      if (hay.indexOf(words[i]) !== -1) s += words[i].length >= 3 ? 3 : 1;
    }
    if (hay.indexOf(query) !== -1) s += 6;
    return s;
  }

  function rankAll(q) {
    var out = [];
    var i;
    for (i = 0; i < INDEX.length; i++) {
      var sc = scoreEntry(q, INDEX[i]);
      if (sc > 0) out.push({ entry: INDEX[i], score: sc });
    }
    out.sort(function (a, b) {
      return b.score - a.score || a.entry.label.length - b.entry.label.length;
    });
    return out;
  }

  function navigateForQuery(q) {
    var query = (q || "").trim();
    if (!query) return;
    if (query.length < 2) {
      window.location.href = "products.html?q=" + encodeURIComponent(query);
      return;
    }
    var ranked = rankAll(query);
    if (ranked.length && ranked[0].score >= 2) {
      window.location.href = ranked[0].entry.url;
      return;
    }
    window.location.href = "products.html?q=" + encodeURIComponent(query);
  }

  function renderSuggest(listEl, q, onPick) {
    var ranked = rankAll(q);
    var top = ranked.slice(0, 6);
    listEl.innerHTML = "";
    if (!q.trim() || q.trim().length < 2 || !top.length) {
      listEl.hidden = true;
      return;
    }
    var i;
    for (i = 0; i < top.length; i++) {
      (function (entry) {
        var li = document.createElement("li");
        li.setAttribute("role", "none");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "option");
        btn.className = "header-search-suggest__btn";
        btn.textContent = entry.label;
        btn.addEventListener("click", function () {
          onPick(entry.url);
        });
        li.appendChild(btn);
        listEl.appendChild(li);
      })(top[i].entry);
    }
    listEl.hidden = false;
  }

  function initGroup(root) {
    var toggle = root.querySelector("[data-site-search-toggle]");
    var pop = root.querySelector(".header-search-pop");
    var input = root.querySelector(".header-search-input");
    var list = root.querySelector(".header-search-suggest");
    var form = root.querySelector(".header-search-form");
    if (!toggle || !pop || !input || !form) return;

    function isOpen() {
      return root.classList.contains("header-search-group--open");
    }

    function open() {
      root.classList.add("header-search-group--open");
      toggle.setAttribute("aria-expanded", "true");
      pop.removeAttribute("hidden");
      pop.setAttribute("aria-hidden", "false");
      input.focus();
    }

    function close() {
      root.classList.remove("header-search-group--open");
      toggle.setAttribute("aria-expanded", "false");
      pop.setAttribute("hidden", "");
      pop.setAttribute("aria-hidden", "true");
      if (list) list.hidden = true;
    }

    pop.setAttribute("hidden", "");
    pop.setAttribute("aria-hidden", "true");

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      if (isOpen()) close();
      else open();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      navigateForQuery(input.value);
    });

    input.addEventListener("input", function () {
      if (list)
        renderSuggest(list, input.value, function (url) {
          window.location.href = url;
        });
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (isOpen() && !root.contains(e.target)) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        close();
        toggle.focus();
      }
    });
  }

  document.querySelectorAll("[data-header-search]").forEach(initGroup);
})();
