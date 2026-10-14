/**
 * components.js
 * Defines three reusable UI components for ShiftFit using Custom Elements.
 * No Shadow DOM — components render into the light DOM so existing CSS works.
 *
 * Components:
 *   <sf-button>       — reusable action button
 *   <sf-form-card>     — reusable form card wrapper
 *   <sf-summary-card>  — reusable summary card wrapper
 *
 * IMPORTANT: All three components use DOM manipulation (createElement +
 * appendChild) rather than reading/setting innerHTML. This avoids a
 * double-processing bug where nested custom elements (e.g. <sf-button>
 * inside <sf-form-card>) get rendered twice, producing empty extra elements.
 * appendChild MOVES existing nodes without re-parsing, so child custom
 * elements that have already been upgraded are moved as-is.
 */

// ==================== SF-BUTTON ====================
//
// Usage:
//   <sf-button variant="primary" full id="btn-check-shift">Check a Shift</sf-button>
//   <sf-button variant="secondary" full>Go Back</sf-button>
//   <sf-button type="submit">Add Class</sf-button>
//
// Attributes:
//   variant  — "primary" (default) or "secondary"
//   full     — if present, button is full-width
//   type     — if "submit", renders as a submit button

class SfButton extends HTMLElement {
  connectedCallback() {
    var variant = this.getAttribute("variant") || "primary";
    var full = this.hasAttribute("full");
    var type = this.getAttribute("type");

    var btn = document.createElement("button");
    btn.className = "btn btn-" + variant;
    if (full) btn.classList.add("btn-full");
    if (type) btn.type = type;

    // Move existing child nodes (e.g. text) into the button
    while (this.firstChild) {
      btn.appendChild(this.firstChild);
    }
    this.appendChild(btn);
  }
}

customElements.define("sf-button", SfButton);

// ==================== SF-FORM-CARD ====================
//
// Usage:
//   <sf-form-card title="Add a Class">
//     <form id="form-add-class">...</form>
//     <ul id="class-list" class="item-list"></ul>
//   </sf-form-card>
//
// Attributes:
//   title — optional heading text rendered as <h3>

class SfFormCard extends HTMLElement {
  connectedCallback() {
    var title = this.getAttribute("title");

    var wrapper = document.createElement("div");
    wrapper.className = "form-card";

    if (title) {
      var h3 = document.createElement("h3");
      h3.textContent = title;
      wrapper.appendChild(h3);
    }

    // Move existing child nodes into the wrapper
    while (this.firstChild) {
      wrapper.appendChild(this.firstChild);
    }
    this.appendChild(wrapper);
  }
}

customElements.define("sf-form-card", SfFormCard);

// ==================== SF-SUMMARY-CARD ====================
//
// Usage:
//   <sf-summary-card title="Classes">
//     <ul id="home-classes" class="summary-list"></ul>
//   </sf-summary-card>
//
//   <sf-summary-card>
//     <p id="confirm-message"></p>
//   </sf-summary-card>
//
// Attributes:
//   title — optional heading text rendered as <h3>

class SfSummaryCard extends HTMLElement {
  connectedCallback() {
    var title = this.getAttribute("title");

    var wrapper = document.createElement("div");
    wrapper.className = "summary-card";

    if (title) {
      var h3 = document.createElement("h3");
      h3.textContent = title;
      wrapper.appendChild(h3);
    }

    // Move existing child nodes into the wrapper
    while (this.firstChild) {
      wrapper.appendChild(this.firstChild);
    }
    this.appendChild(wrapper);
  }
}


// ==================== SF-NOTICE-ALERT ====================
//
// Usage:
//   <sf-notice-alert variant="success" title="Good Fit" description="No conflicts found."></sf-notice-alert>
//   <sf-notice-alert variant="warning" title="Tight Fit" description="Assessment due same day."></sf-notice-alert>
//   <sf-notice-alert variant="destructive" title="Conflict" description="Overlaps a class."></sf-notice-alert>
//
// Attributes:
//   variant     — "success", "warning", or "destructive"
//   title       — bold heading text (e.g. "Good Fit")
//   description — short summary text below the title

class SfNoticeAlert extends HTMLElement {
  static get observedAttributes() {
    return ["variant", "title", "description"];
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  _render() {
    var variant = this.getAttribute("variant") || "success";
    var title = this.getAttribute("title") || "";
    var description = this.getAttribute("description") || "";

    var iconSvg = "";
    if (variant === "success") {
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">'
        + '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>';
    } else if (variant === "warning") {
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">'
        + '<path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>';
    } else {
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">'
        + '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>';
    }

    // Clear previous content
    this.innerHTML = "";

    var wrapper = document.createElement("div");
    wrapper.className = "notice-alert notice-" + variant;

    var iconDiv = document.createElement("div");
    iconDiv.className = "notice-icon";
    iconDiv.innerHTML = iconSvg;

    var contentDiv = document.createElement("div");
    contentDiv.className = "notice-content";

    var titleP = document.createElement("p");
    titleP.className = "notice-title";
    titleP.textContent = title;

    var descP = document.createElement("p");
    descP.className = "notice-description";
    descP.textContent = description;

    contentDiv.appendChild(titleP);
    contentDiv.appendChild(descP);

    wrapper.appendChild(iconDiv);
    wrapper.appendChild(contentDiv);

    this.appendChild(wrapper);
  }
}

customElements.define("sf-notice-alert", SfNoticeAlert);

customElements.define("sf-summary-card", SfSummaryCard);
