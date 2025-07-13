import React from 'react';
import './Modal.css';

interface Props {
  tagName: string;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteTagModal: React.FC<Props> = ({ tagName, onClose, onDelete }) => {

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>タグの削除</h2>
        <p>「{tagName}」を削除しますか？</p>
        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn-cancel">キャンセル</button>
          <button onClick={handleDelete} className="modal-btn-delete">削除</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTagModal;
