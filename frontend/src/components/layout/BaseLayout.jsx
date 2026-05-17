import { Outlet } from "react-router-dom";
import { BaseLayoutWrap } from "./BaseLayout.styles";
import Sidebar from "../sidebar/Sidebar";
import AppBar from "../appBar/AppBar";

const BaseLayout = () => {
  return (
    <BaseLayoutWrap>
      <Sidebar />
      <div className="main-content-wrapper">
        {/* Render AppBar on ALL pages so the mobile menu works */}
        <AppBar />
        <Outlet />
      </div>
    </BaseLayoutWrap>
  );
};

export default BaseLayout;