import React from 'react';
import './Logs.css';

const Logs: React.FC = () => {
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
        <p>勉強ログリスト or チャート</p>
      </div>
    </div>
  );
};

export default Logs;
