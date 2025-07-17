import React, { useEffect, useState } from 'react';
import './Logs.css';
import { db, type StudyLog, type Tag } from '../db';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Logs: React.FC = () => {
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchLogsAndTags = async () => {
      const allLogs = await db.studyLogs.toArray();
      const allTags = await db.tags.toArray();
      setStudyLogs(allLogs);
      setTags(allTags);
    };

    fetchLogsAndTags();
  }, []);

  const openConfirmationModal = (id: number | undefined) => {
    setLogToDelete(id);
    setIsModalOpen(true);
  };

  const handleDeleteLog = async () => {
    if (logToDelete === undefined) return;

    try {
      await db.studyLogs.delete(logToDelete);
      setStudyLogs(prevLogs => prevLogs.filter(log => log.id !== logToDelete));
    } catch (error) {
      console.error('Failed to delete log:', error);
    }
  };

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
              <div className="log-details">
                <p>開始: {log.startTime.toLocaleString()}</p>
                <p>時間: {log.endTime ? formatDuration(log.startTime, log.endTime) : '進行中'}</p>
                <p>タグ: {log.tagIds.length > 0 ? log.tagIds.map(id => getTagName(id)).join(', ') : '-'}</p>
                {log.memo && <p>メモ: {log.memo}</p>}
              </div>
              <button onClick={() => openConfirmationModal(log.id)} className="delete-log-btn">×</button>
            </div>
          ))
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteLog}
        title="ログの削除"
        message1="本当にこの勉強ログを削除しますか？"
        message2="この操作は元に戻せません。"
      />
    </div>
  );
};

export default Logs;
