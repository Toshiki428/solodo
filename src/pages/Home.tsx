import { useState, useEffect } from 'react';
import { db } from '../db';
import AddTagModal from '../components/AddTagModal';
import DeleteTagModal from '../components/DeleteTagModal';
import './Home.css';

const STUDY_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60;  // 5 minutes

type Mode = 'idle' | 'studying' | 'break';

function Home() {
  const [tags, setTags] = useState<{ id?: number; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [time, setTime] = useState<number>(STUDY_DURATION);
  const [mode, setMode] = useState<Mode>('idle');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  const isRunning = mode === 'studying' || mode === 'break';

  useEffect(() => {
    db.tags.toArray().then(setTags);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    // Handle timer completion
    if (time < 0 && mode === 'studying') {
      // In study mode, just let it count into overtime
    } else if (time <= 0 && mode === 'break') {
      // When break is over, reset to idle study mode
      setMode('idle');
      setTime(STUDY_DURATION);
      return; // Stop the interval for this cycle
    }

    const interval = window.setInterval(() => {
      setTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, time, mode]);

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
    setMode('studying');
  };

  const handleStop = async () => {
    const studiedTime = STUDY_DURATION - time;

    try {
      const tagEntries = await db.tags.where('name').anyOf(selectedTags).toArray();
      const tagIds = tagEntries.map(t => t.id).filter(id => id !== undefined) as number[];

      const now = new Date();
      const startTime = new Date(now.getTime() - studiedTime * 1000);

      if (studiedTime > 0) { // Only save if time has passed
        await db.studyLogs.add({
          startTime: startTime,
          endTime: now,
          tagIds: tagIds,
          memo: null
        });
        console.log(`Studied for ${studiedTime} seconds with tags: ${selectedTags.join(', ')}`);
      }

      // Transition to break
      setMode('break');
      setTime(BREAK_DURATION);
      setSelectedTags([]);
    } catch (error) {
      console.error('Failed to save study log:', error);
    }
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
        return <button disabled>休憩中</button>;
    }
  }

  return (
    <div className="home-container">
      <h1>SoloDo</h1>
      <div className={`timer ${mode === 'break' ? 'break-mode' : ''}`}>
        {formatTime(time)}
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
