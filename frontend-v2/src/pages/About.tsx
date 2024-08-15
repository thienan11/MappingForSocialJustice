import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="map-container"
    >
      <div className="bg-white text-black flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold text-red-600 mb-6">About</h1>
        
        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mb-6">
          This research focuses on developing an ethically sound tool that merges architecture, urban design, social justice, 
          and technology to document, analyze, and protect content related to historical events and protests. It aims to harness
          data-driven insights to advance social justice, offering a multi-disciplinary approach for a more equitable society.
        </p>

        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mb-6">
          Visit our website at <a href="https://studiovoice.org" className="text-red-500">studiovoice.org</a>.
        </p>

      </div>
    </motion.div>
  );
};

export default About;
