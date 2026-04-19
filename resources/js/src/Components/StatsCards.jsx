import React from 'react';
import './StatsCards.css';

const StatsCards = ({ stats, clickable = false }) => {
  return (
    <div className="stats-cards-container">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card ${clickable ? 'clickable' : ''}`}>
          <span className="stat-value">{stat.value}</span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
