import React from 'react';
import '../styles/skeleton.css';

export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx}>
                  <div className="skeleton skeleton-text" style={{ width: colIdx === 0 ? '60%' : '90%' }}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="h-48 bg-gray-200">
            <div className="skeleton skeleton-image" style={{ width: '100%', height: '100%' }}></div>
          </div>
          <div className="p-6">
            <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: '1rem' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: '0.5rem' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '90%', marginBottom: '1rem' }}></div>
            <div className="flex gap-2">
              <div className="skeleton skeleton-button" style={{ flex: 1, height: '2.5rem' }}></div>
              <div className="skeleton skeleton-button" style={{ flex: 1, height: '2.5rem' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatsSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="skeleton skeleton-text" style={{ width: '60%', height: '2rem', marginBottom: '0.5rem' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '80%', height: '1rem' }}></div>
        </div>
      ))}
    </div>
  );
};

export const ModalSkeleton = () => {
  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header">
          <div className="skeleton skeleton-text" style={{ width: '200px', height: '1.5rem' }}></div>
          <div className="skeleton skeleton-button" style={{ width: '2rem', height: '2rem' }}></div>
        </div>
        <div className="modal-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton skeleton-text" style={{ width: '100%', height: '1rem', marginBottom: '0.5rem' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '100%', height: '2.5rem' }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


