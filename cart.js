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

  function normalizeLabel(label) {
    return String(label || "").trim().toLowerCase();
  }

  function hasLabel(label) {
    var key = normalizeLabel(label);
    if (!key) return false;
    var items = parseItems();
    var i;
    for (i = 0; i < items.length; i++) {
      if (normalizeLabel(items[i].label) === key) return true;
    }
    return false;
  }

  window.MarwatCart = {
    get: parseItems,
    has: hasLabel,

    add: function (label) {
      var text = String(label || "").trim();
      var count = parseItems().length;
      if (!text) return { ok: false, duplicate: false, count: count };
      if (hasLabel(text)) return { ok: false, duplicate: true, count: count };
      var items = parseItems();
      items.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
        label: text,
      });
      saveItems(items);
      return { ok: true, duplicate: false, count: items.length };
    },

    remove: function (id) {
      var sid = String(id);
      var next = parseItems().filter(function (item) {
        return String(item.id) !== sid;
      });
      saveItems(next);
      return next;
    },

    removeByLabel: function (label) {
      var key = normalizeLabel(label);
      if (!key) return parseItems();
      var next = parseItems().filter(function (item) {
        return normalizeLabel(item.label) !== key;
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

  var BTN_ADD = "Add to Quotation";
  var BTN_IN = "In quotation";
  var BTN_ALREADY = "Already in quotation";

  function getRemoveButton(addBtn) {
    var row = addBtn.closest(".material-item__cart-row");
    return row ? row.querySelector("[data-cart-remove]") : null;
  }

  function setButtonInQuotation(addBtn) {
    addBtn.textContent = BTN_IN;
    addBtn.disabled = true;
    addBtn.setAttribute("aria-disabled", "true");
    addBtn.classList.add("material-item__cart-btn--in");
    addBtn.classList.remove("material-item__cart-btn--duplicate");
    var removeBtn = getRemoveButton(addBtn);
    if (removeBtn) removeBtn.hidden = false;
  }

  function setButtonAvailable(addBtn) {
    addBtn.textContent = BTN_ADD;
    addBtn.disabled = false;
    addBtn.removeAttribute("aria-disabled");
    addBtn.classList.remove("material-item__cart-btn--in", "material-item__cart-btn--duplicate");
    var removeBtn = getRemoveButton(addBtn);
    if (removeBtn) removeBtn.hidden = true;
  }

  function syncCartButtons() {
    document.querySelectorAll(".material-item__cart-row [data-cart-add]").forEach(function (addBtn) {
      var lab = addBtn.getAttribute("data-cart-add");
      if (hasLabel(lab)) setButtonInQuotation(addBtn);
      else setButtonAvailable(addBtn);
    });
  }

  function createRemoveButton(label) {
    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn secondary material-item__cart-btn material-item__cart-btn--remove";
    removeBtn.textContent = "Remove";
    removeBtn.setAttribute("data-cart-remove", label);
    removeBtn.hidden = true;
    return removeBtn;
  }

  function ensureCartActions(wrap, addBtn, label) {
    var actions = wrap.querySelector(".material-item__cart-actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "material-item__cart-actions";
      wrap.textContent = "";
      actions.appendChild(addBtn);
      wrap.appendChild(actions);
    }
    if (!wrap.querySelector("[data-cart-remove]")) {
      actions.appendChild(createRemoveButton(label));
    }
  }

  function injectProductsButtons() {
    var main = document.querySelector("main.page-materials");
    if (!main) return;
    main.querySelectorAll(".material-item").forEach(function (el) {
      var titleEl = el.querySelector(".material-item__title");
      var body = el.querySelector(".material-item__body");
      if (!titleEl || !body) return;
      var label = titleEl.textContent.trim();
      var wrap = body.querySelector(".material-item__cart-row");
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = "material-item__cart-row";
        var actions = document.createElement("div");
        actions.className = "material-item__cart-actions";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn secondary material-item__cart-btn";
        btn.textContent = BTN_ADD;
        btn.setAttribute("data-cart-add", label);
        actions.appendChild(btn);
        actions.appendChild(createRemoveButton(label));
        wrap.appendChild(actions);
        body.appendChild(wrap);
        return;
      }
      var addBtn = wrap.querySelector("[data-cart-add]");
      if (addBtn) ensureCartActions(wrap, addBtn, addBtn.getAttribute("data-cart-add") || label);
    });
    syncCartButtons();
  }

  document.addEventListener(
    "click",
    function (e) {
      var removeTrigger = e.target.closest("[data-cart-remove]");
      if (removeTrigger) {
        e.preventDefault();
        var row = removeTrigger.closest(".material-item__cart-row");
        var addBtn = row && row.querySelector("[data-cart-add]");
        var lab =
          removeTrigger.getAttribute("data-cart-remove") ||
          (addBtn && addBtn.getAttribute("data-cart-add"));
        if (!window.MarwatCart || !lab) return;
        window.MarwatCart.removeByLabel(lab);
        if (addBtn) setButtonAvailable(addBtn);
        if (typeof window.MarwatCart.renderQuotation === "function") {
          window.MarwatCart.renderQuotation();
        }
        syncCartButtons();
        return;
      }

      var trigger = e.target.closest("[data-cart-add]");
      if (!trigger) return;
      e.preventDefault();
      var lab = trigger.getAttribute("data-cart-add");
      if (!window.MarwatCart || !lab) return;
      if (trigger.disabled && hasLabel(lab)) return;

      var result = window.MarwatCart.add(lab);
      if (result.duplicate) {
        trigger.textContent = BTN_ALREADY;
        trigger.classList.add("material-item__cart-btn--duplicate");
        trigger.disabled = true;
        window.setTimeout(function () {
          setButtonInQuotation(trigger);
        }, 1600);
        return;
      }
      if (!result.ok) return;

      setButtonInQuotation(trigger);
      if (typeof window.MarwatCart.renderQuotation === "function") {
        window.MarwatCart.renderQuotation();
      }
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
    window.MarwatCart.syncCartButtons = syncCartButtons;
    render();
    syncCartButtons();

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        window.MarwatCart.clear();
        render();
        syncCartButtons();
      });
    }

    listEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cart-remove-id]");
      if (!btn) return;
      window.MarwatCart.remove(btn.getAttribute("data-cart-remove-id"));
      render();
      syncCartButtons();
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

  window.MarwatCart.syncCartButtons = syncCartButtons;
})();
