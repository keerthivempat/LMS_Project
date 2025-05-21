export default class ConfirmDialog {
    constructor() {
      // Create the dialog elements but don't append to DOM yet
      this.dialog = document.createElement("div");
      this.dialog.innerHTML = this.#template();
      
      // Get references to the elements
      this.dialogElement = this.dialog.querySelector("#confirm-dialog");
      this.titleElem = this.dialog.querySelector("#confirm-title");
      this.messageElem = this.dialog.querySelector("#confirm-message");
      this.okBtn = this.dialog.querySelector("#confirm-ok");
      this.cancelBtn = this.dialog.querySelector("#confirm-cancel");
      
      // Initialize handlers
      this.okHandler = null;
      this.cancelHandler = null;
      
      // Set up event listeners
      this.okBtn.addEventListener("click", () => {
        this.hide();
        if (this.okHandler) this.okHandler();
      });
      
      this.cancelBtn.addEventListener("click", () => {
        this.hide();
        if (this.cancelHandler) this.cancelHandler();
      });
      
      // Apply styles to buttons
      this.#applyStyles();
    }
    
    #template() {
      return `
        <div id="confirm-dialog" style="
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        ">
          <div id="confirm-box" style="
            background-color: #FFFCF4;
            border: 1px solid #57321A;
            padding: 24px;
            border-radius: 16px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          ">
            <h2 id="confirm-title" style="
              font-size: 20px;
              font-weight: bold;
              color: #57321A;
              margin-bottom: 16px;
            ">Confirm</h2>
            <p id="confirm-message" style="
              font-size: 16px;
              color: #57321A;
              margin-bottom: 24px;
            ">Are you sure you want to proceed?</p>
            <div style="display: flex; justify-content: center; gap: 16px;">
              <button id="confirm-cancel">Cancel</button>
              <button id="confirm-ok">Confirm</button>
            </div>
          </div>
        </div>
      `;
    }
    
    #applyStyles() {
      const btnStyle = {
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "14px",
      };
      
      Object.assign(this.cancelBtn.style, {
        ...btnStyle,
        backgroundColor: "#FDF6E3",
        color: "#57321A",
        border: "1px solid #57321A",
      });
      
      Object.assign(this.okBtn.style, {
        ...btnStyle,
        backgroundColor: "#EFC815",
        color: "#57321A",
      });
      
      this.cancelBtn.addEventListener("mouseenter", () => {
        this.cancelBtn.style.backgroundColor = "#FAE9C5";
      });
      
      this.cancelBtn.addEventListener("mouseleave", () => {
        this.cancelBtn.style.backgroundColor = "#FDF6E3";
      });
      
      this.okBtn.addEventListener("mouseenter", () => {
        this.okBtn.style.backgroundColor = "#d8b415";
      });
      
      this.okBtn.addEventListener("mouseleave", () => {
        this.okBtn.style.backgroundColor = "#EFC815";
      });
    }
    
    show({ title = "Confirm", message = "Are you sure?", onConfirm, onCancel }) {
      // Set the dialog content
      this.titleElem.textContent = title;
      this.messageElem.textContent = message;
      this.okHandler = onConfirm;
      this.cancelHandler = onCancel;
      
      // Append to the document body
      document.body.appendChild(this.dialog);
    }
    
    hide() {
      // Completely remove the dialog from the DOM when hiding
      if (document.body.contains(this.dialog)) {
        document.body.removeChild(this.dialog);
      }
    }
    
    // This method is now the same as hide() but kept for semantic clarity
    destroy() {
      this.hide();
    }
  }