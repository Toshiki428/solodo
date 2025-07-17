import React from 'react';
import './Modal.css';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message1: string;
  message2?: string; // オプションの2つ目のメッセージ
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message1,
  message2,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message1}</p>
        {message2 && <p>{message2}</p>}
        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn-cancel">キャンセル</button>
          <button onClick={handleConfirm} className="modal-btn-delete">削除</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
