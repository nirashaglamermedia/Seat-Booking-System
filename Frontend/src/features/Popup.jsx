import React from "react";

function Popup({
  show,
  title = "Notice",
  message = "",
  type = "info",
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}) {
  if (!show) {
    return null;
  }

  const titleClass = {
    success: "text-success",
    error: "text-danger",
    warning: "text-warning",
    info: "text-primary",
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className={`modal-title ${titleClass[type] || titleClass.info}`}>
              {title}
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>

          <div className="modal-footer">
            {onConfirm && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              className={`btn ${
                onConfirm
                  ? "btn-danger"
                  : type === "success"
                  ? "btn-success"
                  : type === "error"
                  ? "btn-danger"
                  : "btn-primary"
              }`}
              onClick={onConfirm || onClose}
            >
              {onConfirm ? confirmText : "OK"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Popup;