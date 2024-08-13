import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Define the type for props
interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="navbar">
      <div className="navbar-col">
        <div id="icon-header" onClick={() => navigate("/")}>
          <h1>Mapping for Social Justice</h1>
        </div>
      </div>

      <div className="navbar-col">
        {location.pathname === '/' && (
          <button className="toggle-sidebar-btn" onClick={toggleSidebar}>Toggle Form</button>
        )}

        <p id="auth-buttons" onClick={() => navigate("/about")}>About</p>
      
        <img
          id="auth-buttons"
          src="./icons/github-icon.png"
          alt="github-icon"
          width="30px"
          onClick={() => window.open("https://github.com/thienan11/MappingforSocialJustice")}
        />
      </div>
    </div>
  );
};

export default Navbar;
