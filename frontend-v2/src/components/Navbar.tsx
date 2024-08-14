import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-white text-black border-b border-gray-200">
      <div className="max-w-screen-lg mx-auto flex justify-between items-center px-3 py-2">
        <div className="flex items-center">
          <div id="icon-header" onClick={() => navigate("/")} className="cursor-pointer mr-5">
            {/* <h1 className="text-2xl text-black m-0">
              Mapping For Social Justice
            </h1> */}
            <img src="/images/logo.png" alt="logo" width="110px" />
          </div>
        </div>

        <div className="flex items-center">
          <p
            id="auth-buttons"
            className="cursor-pointer mr-5 hover:text-red-500"
            onClick={() => navigate("/map")}
          >
            View Map
          </p>

          <p
            id="auth-buttons"
            className="cursor-pointer mr-5 hover:text-red-500"
            onClick={() => navigate("/form")}
          >
            Add Event
          </p>

          <p
            id="auth-buttons"
            className="cursor-pointer mr-5 hover:text-red-500"
            onClick={() => navigate("/about")}
          >
            About
          </p>

          <img
            id="auth-buttons"
            src="./icons/github-icon.png"
            alt="github-icon"
            width="30px"
            className="cursor-pointer mr-5 hover:opacity-80"
            onClick={() => window.open("https://github.com/thienan11/MappingforSocialJustice")}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
