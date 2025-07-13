import React, { useState } from 'react';
import './Modal.css';

interface Props {
  onClose: () => void;
  onAddTag: (tagName: string) => void;
}

const AddTagModal: React.FC<Props> = ({ onClose, onAddTag }) => {
  const [tagName, setTagName] = useState('');

  const handleSubmit = () => {
    if (tagName.trim()) {
      onAddTag(tagName.trim());
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>新しいタグを作成</h2>
        <input 
          type="text" 
          value={tagName} 
          onChange={(e) => setTagName(e.target.value)} 
          placeholder="タグ名を入力"
        />
        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn-cancel">キャンセル</button>
          <button onClick={handleSubmit} className="modal-btn-create">作成</button>
        </div>
      </div>
    </div>
  );
};

export default AddTagModal;
