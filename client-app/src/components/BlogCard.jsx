import React from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaUser, FaTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './BlogCard.css';

const BlogCard = ({ post }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${post.id}`);
  };

  return (
    <motion.div 
      className="blog-card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={handleClick}
    >
      <div className="blog-image">
        <img src={post.image} alt={post.title} />
      </div>
      <div className="blog-content">
        <h2>{post.title}</h2>
        <div className="blog-meta">
          <span><FaCalendar /> {post.date}</span>
          <span><FaUser /> {post.author}</span>
          <span><FaTag /> {post.category}</span>
        </div>
        <p>{post.excerpt}</p>
        <motion.button 
          className="read-more"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Read More
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BlogCard;
