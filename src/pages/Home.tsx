import { useState, useEffect } from 'react';
import { db } from '../db';
import './Home.css';

function Home() {
  const [tags, setTags] = useState<{ id?: number; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

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

  const handleAddTag = () => {
    // TODO: 新規タグ作成モーダルなどを表示
    console.log('Add new tag');
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
          <button 
            key={tag.id} 
            className={`tag-chip ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
            onClick={() => handleTagClick(tag.name)}
            disabled={isRunning}
          >
            {tag.name}
          </button>
        ))}
        <button className="add-tag-btn" onClick={handleAddTag} disabled={isRunning}>+</button>
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
    </div>
  );
}

export default Home;
