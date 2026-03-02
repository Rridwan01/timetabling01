import styled from "styled-components";
import { BlockWrapStyles } from "../../../../styles/global/default";
import { theme } from "../../../../styles/theme/theme";

export const CustomCalendarWrap = styled.div`
  ${BlockWrapStyles}
  min-width: 100%;

  .calendar-head {
    margin-bottom: 20px;
    
    .head-ttl {
      font-size: 20px;
    }
  }

  .calendar-body {
    display: flex;
    justify-content: center;
  }

  .react-calendar {
    background: transparent;
    border: none;
    font-family: ${theme.typography.fontFamily}!important;
    width: 100%;

    .react-calendar__navigation {
      .react-calendar__navigation__arrow {
        color: ${theme.colors.white};
        border-radius: 100vh;

        &:hover {
          background: ${theme.colors.spaceCadet2};
        }
      }

      button:disabled,
      button:enabled:focus {
        background: ${theme.colors.spaceCadet2};
      }

      .react-calendar__navigation__label {
        color: ${theme.colors.white}!important;
        background: ${theme.colors.spaceCadet2};
        border-radius: 100vh;

        &:hover {
          background: ${theme.colors.spaceCadet2};
        }
      }
    }

    .react-calendar__tile {
      color: ${theme.colors.white};
      border-radius: 100vh;
      font-size: 12px;
      padding: 10px 6.6667%;

      &:hover {
        background: ${theme.colors.majorelleBlue};
      }

      &.react-calendar__tile--now {
        background: ${theme.colors.majorelleBlue};
        &.react-calendar__tile--active {
          background: ${theme.colors.majorelleBlue};
        }
      }
    }
  }
`;