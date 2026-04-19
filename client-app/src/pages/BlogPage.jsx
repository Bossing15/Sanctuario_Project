import React from 'react';
import { Link } from 'react-router-dom';
import blogImage1 from '../assets/images/blog1.jpg';
import blogImage2 from '../assets/images/blog2.jpg';
import blogImage3 from '../assets/images/blog3.jpg';
import blogImage4 from '../assets/images/blog4.jpg';
import blogImage5 from '../assets/images/blog5.jpg';
import blogImage6 from '../assets/images/blog6.jpg';
import blogHeroBg from '../assets/images/chris-kofoed-nkLZahNaDW0-unsplash.jpg';
import './BlogPage.css';

function BlogPage() {
  return (
    <div className="blog">
      <div className="blog-hero" style={{ backgroundImage: `url(${blogHeroBg})` }}>
        <h1>Restoration & Respect</h1>
      </div>

      <div className="blog-content">
        <h2>Latest Blog Posts</h2>
        <div className="blog-grid">
          <div className="blog-card">
            <img src={blogImage1} alt="Caring for Memorial Sites" />
            <h3>Caring for Memorial Sites</h3>
            <Link to="/blog/1" className="read-more">Read More</Link>
          </div>
          <div className="blog-card">
            <img src={blogImage2} alt="Grave Yard Maintenance" />
            <h3>Grave Yard Maintenance</h3>
            <Link to="/blog/2" className="read-more">Read More</Link>
          </div>
          <div className="blog-card">
            <img src={blogImage3} alt="A Touch of Peace" />
            <h3>A Touch of Peace</h3>
            <Link to="/blog/3" className="read-more">Read More</Link>
          </div>
          <div className="blog-card">
            <img src={blogImage4} alt="Clean Space, Peaceful Memories" />
            <h3>Clean Space, Peaceful</h3>
            <Link to="/blog/4" className="read-more">Read More</Link>
          </div>
          <div className="blog-card">
            <img src={blogImage5} alt="Respect in Every Service" />
            <h3>Respect in Every Service</h3>
            <Link to="/blog/5" className="read-more">Read More</Link>
          </div>
          <div className="blog-card">
            <img src={blogImage6} alt="Love Shown in Clean Places" />
            <h3>Love Shown in Clean Places</h3>
            <Link to="/blog/6" className="read-more">Read More</Link>
          </div>
        </div>

        {/* Removed services-highlight section from BlogPage as requested */}
      </div>
    </div>
  );
}

export default BlogPage;
