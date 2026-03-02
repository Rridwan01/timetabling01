import styled from "styled-components";
import { media } from "../../styles/theme/theme";

export const DashboardScreenWrap = styled.div`
  overflow-x: hidden;
  background-color: transparent;

  .dboard-blocks-row {
    display: grid;
    gap: 20px;

    &.auxiliary-row {
      /* Calendar takes up 2/3rds, Team members take up 1/3rd */
      grid-template-columns: 2fr 1fr;

      ${media.lg`
        grid-template-columns: 1fr;
      `}
    }

    ${media.xxxl`
      gap: 12px;
    `}
  }

  [class$="row"].dboard-blocks-row {
    margin-bottom: 20px;

    ${media.xxxl`
      margin-bottom: 12px;
    `}
  }
`;