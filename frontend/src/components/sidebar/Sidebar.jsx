import { SidebarWrap } from "./Sidebar.styles";
import { FaSkyatlas } from "react-icons/fa6";
import {
  MdClose,
  MdDashboard,
  MdLibraryBooks,
  MdMeetingRoom,
  MdTune,
  MdAutorenew,
  MdCalendarMonth,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarClose } from "../../redux/slices/sidebarSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);

  return (
    <SidebarWrap
      className={`${isSidebarOpen ? "sidebar-active" : ""}`}
    >
      <div className="sidebar-content">
        <div className="sidebar-head">
          <span className="site-icon">
            <FaSkyatlas />
          </span>
          <h3 className="site-name">Timetabling</h3>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => dispatch(setSidebarClose())}
          >
            <MdClose size={20} />
          </button>
        </div>
        <nav className="sidebar-nav scrollbar">
          <ul className="sidenav-list">
            
            {/* Dashboard: Standard dashboard layout icon */}
            <li className="sidenav-item">
              <Link to="/" className="sidenav-link">
                <span className="link-icon">
                  <MdDashboard size={24} />
                </span>
                <span className="link-text">Dashboard</span>
              </Link>
            </li>

            {/* Course Management: Stack of books */}
            <li className="sidenav-item">
              <Link to="/course-management" className="sidenav-link">
                <span className="link-icon">
                  <MdLibraryBooks size={24} />
                </span>
                <span className="link-text">Course Management</span>
              </Link>
            </li>

            {/* Room Management: A physical room/doorway */}
            <li className="sidenav-item">
              <Link to="/room-management" className="sidenav-link">
                <span className="link-icon">
                  <MdMeetingRoom size={24} />
                </span>
                <span className="link-text">Room Management</span>
              </Link>
            </li>

            {/* Constraints: Tuning dials to represent parameter adjustments */}
            <li className="sidenav-item">
              <Link to="/constraints" className="sidenav-link">
                <span className="link-icon">
                  <MdTune size={24} />
                </span>
                <span className="link-text">Constraints</span>
              </Link>
            </li>

            {/* Generate Timetable: Looping arrows to represent the algorithm iterating */}
            <li className="sidenav-item">
              <Link to="/generate-timetable" className="sidenav-link">
                <span className="link-icon">
                  <MdAutorenew size={24} />
                </span>
                <span className="link-text">Generate Timetable</span>
              </Link>
            </li>

            {/* Timetable View: A standard calendar */}
            <li className="sidenav-item">
              <Link to="/timetable-view" className="sidenav-link">
                <span className="link-icon">
                  <MdCalendarMonth size={24} />
                </span>
                <span className="link-text">Timetable View</span>
              </Link>
            </li>
            
          </ul>
        </nav>
      </div>
    </SidebarWrap>
  );
};

export default Sidebar;