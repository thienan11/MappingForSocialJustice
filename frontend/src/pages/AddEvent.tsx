import React from 'react';
import { motion } from 'framer-motion';

const AddEvent: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="map-container"
    >
      <div className="bg-white text-black flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold text-red-600 mb-6">Add an Event</h1>

        

      </div>
    </motion.div>
  );
};

export default AddEvent;
