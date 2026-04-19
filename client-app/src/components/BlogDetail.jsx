import React from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaUser, FaTag, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './BlogDetail.css';

const BlogDetail = ({ post }) => {
  const navigate = useNavigate();

  return (
    <div className="blog-detail-container">
      <motion.button 
        className="back-button"
        onClick={() => navigate('/blog')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaArrowLeft /> Back to Blog
      </motion.button>

      <div className="blog-detail-header">
        <div className="blog-detail-image">
          <img src={post.image} alt={post.title} />
        </div>
        <h1>{post.title}</h1>
        <div className="blog-detail-meta">
          <span><FaCalendar /> {post.date}</span>
          <span><FaUser /> {post.author}</span>
          <span><FaTag /> {post.category}</span>
        </div>
      </div>

      <div className="blog-detail-content">
        <p>{post.content}</p>
      </div>

      <div className="blog-detail-footer">
        <h3>Share this post</h3>
        <div className="share-buttons">
          {/* Add social share buttons here */}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
