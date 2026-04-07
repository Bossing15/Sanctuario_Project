import React from 'react';
import { motion } from 'framer-motion';
import './ServiceCard.css';

const ServiceCard = ({ service }) => {
  return (
    <motion.div
      className="service-card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="service-icon">
        {service.icon}
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <div className="service-images">
        {service.images.map((image, index) => (
          <div key={index} className="service-image">
            <img src={image} alt={`${service.title} ${index + 1}`} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ServiceCard;