import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="min-h-screen bg-white text-black">
        {/* Hero Section */}
        <div className="hero text-center py-16 px-4">
          <h1 className="text-5xl font-bold mb-4">MAPPING FOR
            <span className="text-red-500"> SOCIAL JUSTICE</span>
          </h1>

          <p className="hero-descriptor text-gray-600 max-w-xl mx-auto mb-8">
            Explore how mapping and spatial visualization can enhance understanding and advocacy for social justice. Our platform allows users to document and visualize protests and other events to support fact-finding and analysis efforts.
          </p>

          <button
            className="start-btn bg-white text-red-500 font-bold py-3 px-8 rounded-full inline-flex items-center border-2 border-red-500 transition duration-300 ease-in-out transform hover:bg-red-500 hover:text-white hover:scale-105 hover:shadow-lg"
            onClick={() => navigate("/map")}
          >
            <span className="mr-2">Get Started</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="mt-12">
            <img src="/images/demo.png" alt="Demo" width="950px" className="mx-auto" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;