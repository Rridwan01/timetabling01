import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { AppBarWrap } from "./AppBar.styles";
import { setSidebarOpen } from "../../redux/slices/sidebarSlice";
import { MdMenu } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Images } from "../../assets/images";

const AppBar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

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
        </div>
        
        <div className="appbar-head-main">
          <h3 className="appbar-head-ttl">{pageTitle}</h3>
          
          <div className="appbar-head-rtl">
            {/* Removed the fake search bar and notification bell */}
            
            <div className="appbar-head-misc">
              <button 
                type="button" 
                className="appbar-head-info"
                onClick={() => alert("Automated Exam Timetabling System\nBuilt for optimization and clash-free scheduling.")}
              >
                <IoMdInformationCircleOutline size={26} />
              </button>
            </div>

            {/* Personalized Profile Section */}
            <div className="appbar-head-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>Ridwan</span>
                <span style={{ color: '#aaa', fontSize: '12px' }}>System Admin</span>
              </div>
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