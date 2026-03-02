import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { AppBarWrap } from "./AppBar.styles";
import { setSidebarOpen } from "../../redux/slices/sidebarSlice";
import { MdMenu, MdNotifications } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Images } from "../../assets/images";

const AppBar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Dynamically set the title based on the current URL path
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/": return "Main Dashboard";
      case "/course-management": return "Course Management";
      case "/room-management": return "Room Management";
      case "/constraints": return "Constraints";
      case "/generate-timetable": return "Generate Timetable";
      case "/timetable-view": return "Timetable View";
      default: return "Dashboard";
    }
  };

  const pageTitle = getPageTitle();

  return (
    <AppBarWrap>
      <div className="appbar-content">
        <div className="appbar-head-top">
          <button
            type="button"
            className="sidebar-open-btn"
            onClick={() => dispatch(setSidebarOpen())}
          >
            <MdMenu size={24} />
          </button>
          {/* <p className="appbar-head-breadcrumb">Pages / {pageTitle}</p> */}
        </div>
        
        <div className="appbar-head-main">
          <h3 className="appbar-head-ttl">{pageTitle}</h3>
          
          <div className="appbar-head-rtl">
            <form className="appbar-head-search">
              <span className="appbar-search-icon">
                <FiSearch />
              </span>
              <input
                type="text"
                className="appbar-search-input"
                placeholder="Search"
              />
            </form>
            <div className="appbar-head-misc">
              <button type="button" className="appbar-head-notif">
                <MdNotifications size={24} />
              </button>
              <button type="button" className="appbar-head-info">
                <IoMdInformationCircleOutline size={24} />
              </button>
            </div>
            <div className="appbar-head-profile">
              <div className="appbar-head-avatar">
                <img src={Images.Avatar} alt="Profile" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppBarWrap>
  );
};

export default AppBar;