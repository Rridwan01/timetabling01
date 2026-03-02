import CustomCalendar from "../../components/pages/dashboard/CustomCalendar/CustomCalendar"
import Summary from "../../components/pages/dashboard/Summary/Summary"
import TeamMember from "../../components/pages/dashboard/TeamMember/TeamMember"
import { DashboardScreenWrap } from "./DashboardScreen.styles"

const DashboardScreen = () => {
  return (
    <DashboardScreenWrap>
      {/* 4 Metrics + The Generation Banner */}
      <Summary />

      {/* Simplified bottom row for auxiliary dashboard info */}
      <div className="dboard-blocks-row auxiliary-row">
        <CustomCalendar />
        <TeamMember />
      </div>
    </DashboardScreenWrap>
  )
}

export default DashboardScreen