import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="navbar-col">
        {/* <img
          id="icon-header"
          src="favicon.ico"
          alt="nav-icon"
          width="30px"
          onClick={() => navigate("/")}  // replace history.push with navigate
        /> */}
        <div id="icon-header" onClick={() => navigate("/")}>
          <h1>Mapping for Social Justice</h1>
        </div>
      </div>

      <div className="navbar-col">
        <button className="toggle-sidebar-btn" onClick={toggleSidebar}>View Form</button>

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
