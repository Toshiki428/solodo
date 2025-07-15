import React, { useEffect, useState } from 'react';
import './Logs.css';
import { db, type StudyLog, type Tag } from '../db';

const Logs: React.FC = () => {
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchLogsAndTags = async () => {
      const allLogs = await db.studyLogs.toArray();
      const allTags = await db.tags.toArray();
      setStudyLogs(allLogs);
      setTags(allTags);
    };

    fetchLogsAndTags();
  }, []);

  const getTagName = (tagId: number) => {
    const tag = tags.find(t => t.id === tagId);
    return tag ? tag.name : 'Unknown Tag';
  };

  const formatDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime(); // ミリ秒単位の差
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const displaySeconds = seconds % 60;
    const displayMinutes = minutes % 60;
    const displayHours = hours;

    let durationString = '';
    if (displayHours > 0) {
      durationString += `${displayHours}時間`;
    }
    if (displayMinutes > 0 || displayHours > 0) { // 時間がある場合、分も表示
      durationString += `${displayMinutes}分`;
    }
    durationString += `${displaySeconds}秒`;

    return durationString;
  };

  return (
    <div className="logs-container">
      <h1>勉強ログ</h1>
      <div className="filter-section">
        <p>カレンダー or 日付範囲選択</p>
      </div>
      <div className="filter-section">
        <p>タグフィルター</p>
      </div>
      <div className="log-list">
        {studyLogs.length === 0 ? (
          <p>勉強ログがありません。</p>
        ) : (
          studyLogs.map((log) => (
            <div key={log.id} className="log-item">
              <p>開始: {log.startTime.toLocaleString()}</p>
              <p>時間: {log.endTime ? formatDuration(log.startTime, log.endTime) : '進行中'}</p>
              <p>タグ: {log.tagIds.length > 0 ? log.tagIds.map(id => getTagName(id)).join(', ') : '-'}</p>
              {log.memo && <p>メモ: {log.memo}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Logs;
