import CustomCalendar from "../../components/pages/dashboard/CustomCalendar/CustomCalendar"
import Summary from "../../components/pages/dashboard/Summary/Summary"
import SystemLogs from "../../components/pages/dashboard/SystemLog/SystemLogs"
import { DashboardScreenWrap } from "./DashboardScreen.styles"

const DashboardScreen = () => {
  return (
    <DashboardScreenWrap>
      {/* 4 Metrics + The Generation Banner */}
      <Summary />

      {/* Simplified bottom row for auxiliary dashboard info */}
      <div className="dboard-blocks-row auxiliary-row">
        <CustomCalendar />
        <SystemLogs />
      </div>
    </DashboardScreenWrap>
  )
}

export default DashboardScreen