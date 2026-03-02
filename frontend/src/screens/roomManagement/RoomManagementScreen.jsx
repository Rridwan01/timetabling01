import React from "react";
import { RoomManagement } from "./RoomManagementScreen.styles";
import RoomManagementTable from "../../components/pages/dashboard/RoomManagement/RoomManagementTable.jsx";

const RoomManagementScreen = () => {
  return (
    <RoomManagement>
      <div className="screen-header">
        <p>Manage examination halls, tracking their capacities and availability for scheduling.</p>
      </div>

      <div className="table-container">
        <RoomManagementTable />
      </div>
    </RoomManagement>
  );
};

export default RoomManagementScreen;