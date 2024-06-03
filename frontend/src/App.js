import React, { useState } from 'react';
import './App.css';
import Map from './components/Map';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import About from './components/About';
import Navbar from './components/Navbar';

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };
  
  return (
    <Router>
      <Navbar toggleSidebar={toggleSidebar} />
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/" element={<Map isSidebarVisible={isSidebarVisible} />} /> {/* Pass the sidebar state */}
      </Routes>
    </Router>
  );
}

export default App;
