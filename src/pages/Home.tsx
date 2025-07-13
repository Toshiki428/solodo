import { useState, useEffect } from 'react';
import { db } from '../db';
import AddTagModal from '../components/AddTagModal';
import DeleteTagModal from '../components/DeleteTagModal';
import './Home.css';

function Home() {
  const [tags, setTags] = useState<{ id?: number; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  useEffect(() => {
    db.tags.toArray().then(setTags);
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const handleTagClick = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName) 
        : [...prev, tagName]
    );
  };

  const handleAddTag = async (tagName: string) => {
    try {
      const newTag = { name: tagName };
      const id = await db.tags.add(newTag);
      setTags(prev => [...prev, { ...newTag, id }]);
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const openDeleteModal = (tagName: string) => {
    setTagToDelete(tagName);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    try {
      const tagEntry = await db.tags.where('name').equals(tagToDelete).first();
      if (tagEntry && tagEntry.id) {
        await db.tags.delete(tagEntry.id);
        setTags(prev => prev.filter(t => t.name !== tagToDelete));
        setSelectedTags(prev => prev.filter(t => t !== tagToDelete));
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    // ここで勉強時間とタグをDBに保存する処理を後で追加します。
    console.log(`Studied for ${time} seconds with tags: ${selectedTags.join(', ')}`);
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="home-container">
      <h1>SoloDo</h1>
      <div className="timer">
        {formatTime(time)}
      </div>
      <div className="tags-container">
        {tags.map(tag => (
          <div 
            key={tag.id} 
            className={`tag-chip ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
            onClick={() => handleTagClick(tag.name)}
          >
            <span>{tag.name}</span>
            <button 
              className="delete-tag-btn" 
              onClick={(e) => { 
                e.stopPropagation(); 
                openDeleteModal(tag.name); 
              }} 
              disabled={isRunning}
            >×</button>
          </div>
        ))}
        <button className="add-tag-btn" onClick={() => setIsAddModalOpen(true)} disabled={isRunning}>+</button>
      </div>
      <div className="controls">
        {!isRunning ? (
          <button onClick={handleStart} disabled={selectedTags.length === 0}>
            勉強開始
          </button>
        ) : (
          <button onClick={handleStop}>
            勉強終了
          </button>
        )}
      </div>
      {isAddModalOpen && (
        <AddTagModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAddTag={handleAddTag} 
        />
      )}
      {isDeleteModalOpen && tagToDelete && (
        <DeleteTagModal
          tagName={tagToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteTag}
        />
      )}
    </div>
  );
}

export default Home;
