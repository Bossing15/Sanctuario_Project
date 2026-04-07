import React from 'react';

const TestApp = () => {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">React is Working!</h1>
        <p className="text-gray-600">If you can see this, React is loading correctly.</p>
        <div className="mt-4">
          <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestApp;