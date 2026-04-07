import { useState, useEffect } from "react";
import servicesIcon from "../assets/icons/icons8-services-50.png";

const Services = () => {
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServiceList(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen p-8">
      <h3 className="text-3xl font-bold text-gray-800 mb-8">Service Management</h3>
      {loading ? <p>Loading...</p> : <p>Services: {serviceList.length}</p>}
    </div>
  );
};

export default Services;
