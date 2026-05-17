(function () {
  "use strict";

  var STORAGE_KEY = "marwat_cart_v1";

  function parseItems() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  window.MarwatCart = {
    get: parseItems,

    add: function (label) {
      var text = String(label || "").trim();
      if (!text) return parseItems().length;
      var items = parseItems();
      items.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
        label: text,
      });
      saveItems(items);
      return items.length;
    },

    remove: function (id) {
      var sid = String(id);
      var next = parseItems().filter(function (item) {
        return String(item.id) !== sid;
      });
      saveItems(next);
      return next;
    },

    clear: function () {
      saveItems([]);
    },

    plainTextLines: function () {
      var items = parseItems();
      var lines = [];
      var i;
      for (i = 0; i < items.length; i++) lines.push(items[i].label);
      return lines.join("\n");
    },
  };

  function injectProductsButtons() {
    var main = document.querySelector("main.page-materials");
    if (!main) return;
    main.querySelectorAll(".material-item").forEach(function (el) {
      var titleEl = el.querySelector(".material-item__title");
      var body = el.querySelector(".material-item__body");
      if (!titleEl || !body || body.querySelector(".material-item__cart-row")) return;
      var wrap = document.createElement("div");
      wrap.className = "material-item__cart-row";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn secondary material-item__cart-btn";
      btn.textContent = "Add to Quotation";
      btn.setAttribute("data-cart-add", titleEl.textContent.trim());
      wrap.appendChild(btn);
      body.appendChild(wrap);
    });
  }

  document.addEventListener(
    "click",
    function (e) {
      var trigger = e.target.closest("[data-cart-add]");
      if (!trigger) return;
      e.preventDefault();
      var lab = trigger.getAttribute("data-cart-add");
      if (!window.MarwatCart || !lab) return;
      window.MarwatCart.add(lab);
      var orig = trigger.textContent;
      trigger.textContent = "Added";
      trigger.setAttribute("disabled", "disabled");
      if (typeof window.MarwatCart.renderQuotation === "function") {
        window.MarwatCart.renderQuotation();
      }
      window.setTimeout(function () {
        trigger.textContent = orig;
        trigger.removeAttribute("disabled");
      }, 1100);
    },
    false
  );

  function syncQuoteDetails(items) {
    var ta = document.getElementById("q_details");
    if (!ta || ta.dataset.userEdited === "1") return;
    if (!items.length) {
      if (ta.dataset.autoFilled === "1") ta.value = "";
      return;
    }
    ta.value = "Material list:\n" + window.MarwatCart.plainTextLines();
    ta.dataset.autoFilled = "1";
  }

  function bindCartPage() {
    var listEl = document.getElementById("cart-items");
    var emptyEl = document.getElementById("cart-empty");
    var clearBtn = document.getElementById("cart-clear");
    var copyTa = document.getElementById("cart-copy-plain");
    var detailsTa = document.getElementById("q_details");
    if (!listEl || !emptyEl) return;

    if (detailsTa) {
      detailsTa.addEventListener("input", function () {
        detailsTa.dataset.userEdited = "1";
        detailsTa.removeAttribute("data-auto-filled");
      });
    }

    function render() {
      var cart = window.MarwatCart;
      var items = cart.get();
      listEl.innerHTML = "";
      if (!items.length) {
        listEl.hidden = true;
        emptyEl.hidden = false;
        if (copyTa) {
          copyTa.value = "";
        }
        return;
      }
      emptyEl.hidden = true;
      listEl.hidden = false;
      var i;
      for (i = 0; i < items.length; i++) {
        (function (item) {
          var li = document.createElement("li");
          var label = document.createElement("span");
          label.textContent = item.label;
          var rm = document.createElement("button");
          rm.type = "button";
          rm.className = "btn secondary cart-page-remove";
          rm.textContent = "Remove";
          rm.setAttribute("data-cart-remove-id", item.id);
          li.appendChild(label);
          li.appendChild(rm);
          listEl.appendChild(li);
        })(items[i]);
      }
      if (copyTa) {
        copyTa.value = cart.plainTextLines();
      }
      syncQuoteDetails(items);
    }

    window.MarwatCart.renderQuotation = render;
    render();

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        window.MarwatCart.clear();
        render();
      });
    }

    listEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cart-remove-id]");
      if (!btn) return;
      window.MarwatCart.remove(btn.getAttribute("data-cart-remove-id"));
      render();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      injectProductsButtons();
      bindCartPage();
    });
  } else {
    injectProductsButtons();
    bindCartPage();
  }
})();
