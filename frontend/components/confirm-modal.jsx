import React from "react";
import Modal from "react-modal";

const modalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
    zIndex: 3,
  },
  content: {
    background: "white",
    margin: "auto",
    width: 350,
    height: 120,
    border: "solid 1px black",
    borderRadius: "6px",
    color: "black",
    lineHeight: "30px",
  },
};

export default function ConfirmModal({
  isOpen,
  header,
  confirmText,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Modal"
      style={modalStyles}
    >
      <p
        style={{
          fontSize: 20,
          fontWeight: 500,
          fontFamily: "Helvetica Neue",
          letterSpacing: 1.08,
          textAlign: "center",
          marginBottom: 15,
        }}
      >
        {header}
      </p>
      <div className="text-center">
        <a className="btn btn-danger" onClick={onConfirm}>
          {confirmText}
        </a>
      </div>
    </Modal>
  );
}
