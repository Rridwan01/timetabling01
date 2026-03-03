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
    <SidebarWrap className={`${isSidebarOpen ? "sidebar-active" : ""}`}>
      <div className="sidebar-content">
        <div className="sidebar-head">
          <span className="site-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4318ff" /* Your primary purple/blue */
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "10px" }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
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
