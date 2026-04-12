import React from 'react';
import './StatsCards.css';

const StatsCards = ({ stats }) => {
  return (
    <div className="stats-cards-container">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <span className="stat-value">{stat.value}</span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
