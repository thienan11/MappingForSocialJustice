import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white text-black border-b border-gray-200"
    >
    <div className="sticky top-0 z-50 bg-white text-black border-b border-gray-200">
      {/* use max-w-screen-lg to reduce width? */}
      <div className="w-full mx-auto flex justify-between items-center px-6 py-2">
        <div className="flex items-center">
          <div id="icon-header" onClick={() => navigate("/")} className="cursor-pointer mr-5">
            {/* <h1 className="text-2xl text-black m-0">
              Mapping For Social Justice
            </h1> */}
            <img src="/images/logo.png" alt="logo" width="110px" />
          </div>
        </div>

        <div className="flex items-center">
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `cursor-pointer mr-5 hover:text-red-500 ${isActive ? 'text-red-500' : ''}`
            }
          >
            View Map
          </NavLink>

          {/* <NavLink
            to="/form"
            className={({ isActive }) =>
              `cursor-pointer mr-5 hover:text-red-500 ${isActive ? 'text-red-500' : ''}`
            }
          >
            Add Event
          </NavLink> */}

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `cursor-pointer mr-5 hover:text-red-500 ${isActive ? 'text-red-500' : ''}`
            }
          >
            About
          </NavLink>

          <img
            id="nav-buttons"
            src="./icons/github-icon.png"
            alt="github-icon"
            width="30px"
            className="cursor-pointer mr-5 hover:opacity-80"
            onClick={() => window.open("https://github.com/thienan11/MappingforSocialJustice")}
          />
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
