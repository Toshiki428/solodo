import { useState, useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { db } from '../db';
import AddTagModal from '../components/AddTagModal';
import DeleteTagModal from '../components/DeleteTagModal';
import './Home.css';

function Home() {
  const { remaining, elapsed, timerStartRef, mode, isRunning, start, stop, reset } = useTimer();
  const [tags, setTags] = useState<{ id?: number; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = usePersistentState<string[]>('solodo-tags', []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  // 初回マウント時にタグを取得
  useEffect(() => {
    db.tags.toArray().then(setTags);
  }, []);

  const handleTagClick = (tagName: string) => {
    if (isRunning) return; // Prevent tag selection while timer is running
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

        // タグを消した際、studyLogsのタグを取り除く
        const studyLogsToUpdate = await db.studyLogs.where('tagIds').anyOf(tagEntry.id).toArray();
        for (const log of studyLogsToUpdate) {
          const updatedTagIds = log.tagIds.filter(id => id !== tagEntry.id);
          await db.studyLogs.update(log.id!, { tagIds: updatedTagIds });
        }
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const handleStart = () => {
    start();
  };

  const handleStop = async () => {
    try {
      const tagEntries = await db.tags.where('name').anyOf(selectedTags).toArray();
      const tagIds = tagEntries.map(t => t.id).filter(id => id !== undefined) as number[];

      const now = new Date();
      const startTime = timerStartRef ? timerStartRef : new Date(now.getTime() - elapsed * 1000);

      if (elapsed > 0) { // Only save if time has passed
        await db.studyLogs.add({
          startTime: startTime,
          endTime: now,
          tagIds: tagIds,
          memo: null
        });
        console.log(`Studied for ${elapsed} seconds with tags: ${selectedTags.join(', ')}`);
      }

      stop();
      setSelectedTags([]);
    } catch (error) {
      console.error('Failed to save study log:', error);
    }
  };

  const handleEndBreak = () => {
    reset();
  };

  const formatTime = (seconds: number) => {
    const isOvertime = seconds < 0;
    const absSeconds = Math.abs(seconds);

    const h = Math.floor(absSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((absSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (absSeconds % 60).toString().padStart(2, '0');
    
    const timeString = `${h}:${m}:${s}`;
    return isOvertime ? `-${timeString}` : timeString;
  };

  const renderControlButton = () => {
    switch (mode) {
      case 'idle':
        return <button onClick={handleStart}>勉強開始</button>;
      case 'studying':
        return <button onClick={handleStop}>勉強終了</button>;
      case 'break':
        return <button onClick={handleEndBreak}>休憩終了</button>;
    }
  }

  return (
    <div className="home-container">
      <h1>SoloDo</h1>
      <div className={`timer ${mode === 'break' ? 'break-mode' : ''}`}>
        {formatTime(remaining)}
      </div>
      <div className="tags-container">
        {tags.map(tag => (
          <div
            key={tag.id}
            className={`tag-chip ${selectedTags.includes(tag.name) ? 'selected' : ''} ${isRunning ? 'disabled' : ''}`}
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
        {renderControlButton()}
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
