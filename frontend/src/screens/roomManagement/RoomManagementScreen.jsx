import PropTypes from "prop-types";
import { RoomManagement } from "./RoomManagementScreen.styles";
import RoomManagementTable from "../../components/pages/dashboard/RoomManagement/RoomManagementTable.jsx";


const RoomManagementScreen = ({ onAuthError }) => {
RoomManagementScreen.propTypes = {
  onAuthError: PropTypes.func,
};
  return (
    <RoomManagement>
      <div className="screen-header">
        <p>Manage examination halls, tracking their capacities and availability for scheduling.</p>
      </div>

      <div className="table-container">
        <RoomManagementTable onAuthError={onAuthError} />
      </div>
    </RoomManagement>
  );
};

export default RoomManagementScreen;