import React, { useEffect, useState, useMemo } from 'react';
import './Logs.css';
import { db, type StudyLog, type Tag } from '../db';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Logs: React.FC = () => {
  const [allStudyLogs, setAllStudyLogs] = useState<StudyLog[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchLogsAndTags = async () => {
      // ログを開始時間の降順で取得
      const allLogs = await db.studyLogs.orderBy('startTime').reverse().toArray();
      const allTags = await db.tags.toArray();
      setAllStudyLogs(allLogs);
      setTags(allTags);
    };

    fetchLogsAndTags();
  }, []);

  const handleTagFilterChange = (tagId: number) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const filteredLogs = useMemo(() => {
    let effectiveStartDate: Date | null = null;
    let effectiveEndDate: Date | null = null;

    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    if (parsedStartDate && parsedEndDate) {
      if (parsedStartDate <= parsedEndDate) {
        effectiveStartDate = parsedStartDate;
        effectiveEndDate = parsedEndDate;
      } else {
        // 順序が逆転している場合、入れ替える
        effectiveStartDate = parsedEndDate;
        effectiveEndDate = parsedStartDate;
      }
    } else if (parsedStartDate) {
      effectiveStartDate = parsedStartDate;
    } else if (parsedEndDate) {
      effectiveEndDate = parsedEndDate;
    }

    if (effectiveStartDate) {
      effectiveStartDate.setHours(0, 0, 0, 0);
    }
    if (effectiveEndDate) {
      effectiveEndDate.setHours(23, 59, 59, 999);
    }

    return allStudyLogs.filter(log => {
      const logDate = new Date(log.startTime);
      // 日付フィルター
      if (effectiveStartDate && logDate < effectiveStartDate) return false;
      if (effectiveEndDate && logDate > effectiveEndDate) return false;

      // タグフィルター
      if (selectedTagIds.length > 0) {
        // 選択されたすべてのタグIDがログのタグIDに含まれているか
        const hasAllSelectedTags = selectedTagIds.every(selectedTagId => log.tagIds.includes(selectedTagId));
        if (!hasAllSelectedTags) return false;
      }

      return true;
    });
  }, [allStudyLogs, startDate, endDate, selectedTagIds]);

  const openConfirmationModal = (id: number | undefined) => {
    setLogToDelete(id);
    setIsModalOpen(true);
  };

  const handleDeleteLog = async () => {
    if (logToDelete === undefined) return;

    try {
      await db.studyLogs.delete(logToDelete);
      // allStudyLogsから削除されたログを除外してUIを更新
      setAllStudyLogs(prevLogs => prevLogs.filter(log => log.id !== logToDelete));
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
      <div className="logs-header">
        <h1>勉強ログ</h1>
        <div className="filter-section">
          <h3>日付フィルター</h3>
          <div className="date-filter">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            <span>〜</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
          </div>
          <h3>タグフィルター</h3>
          <div className="tag-filter-chips">
            {tags.map(tag => (
              <div
                key={tag.id}
                className={`tag-chip ${selectedTagIds.includes(tag.id!) ? 'selected' : ''}`}
                onClick={() => handleTagFilterChange(tag.id!)}
              >
                <span>{tag.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="log-list">
        {filteredLogs.length === 0 ? (
          <p>勉強ログがありません。</p>
        ) : (
          filteredLogs.map((log) => (
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
