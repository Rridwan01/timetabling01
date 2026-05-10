import styled from "styled-components";
import { media } from "../../styles/theme/theme";

export const DashboardScreenWrap = styled.div`
  overflow-x: hidden;
  background-color: transparent;

  .dboard-blocks-row {
    display: grid;
    gap: 20px;

    .auxiliary-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 24px;
      align-items: start;
      width: 100%;
    }

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
