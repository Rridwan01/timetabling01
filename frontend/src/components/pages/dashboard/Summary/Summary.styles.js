import styled from "styled-components";
import { media, theme } from "../../../../styles/theme/theme";

export const SummaryWrap = styled.div`
  margin-bottom: 20px;

  ${media.xxxl`
    margin-bottom: 12px;
  `}

  .dboard-summary-blocks {
    display: grid;
    /* Changed from 6 to 4 columns to fit the new metrics perfectly */
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    align-items: start;

    ${media.xxxl`
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    `}

    ${media.sm`
      grid-template-columns: repeat(1, 1fr);
    `}
  }

  .dboard-block {
    display: flex;
    align-items: center;
    column-gap: 16px;
    padding: 20px 16px;

    .summary-block-icon {
      width: 48px;
      height: 48px;
      background-color: ${theme.colors.spaceCadet2};
      border-radius: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      color: ${theme.colors.majorelleBlue};

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .summary-block-ttl {
      font-size: 14px;
      color: ${theme.colors.powderBlue};
      font-weight: 500;
    }

    .summary-block-details {
      display: flex;
      flex-direction: column;
      row-gap: 2px;
    }
    
    .summary-block-val {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.4;
      color: ${theme.colors.white};
    }
    
    .summary-block-text {
      font-size: 12px;
      font-weight: 400;
      color: ${theme.colors.powderBlue};

      .text-percent {
        color: ${theme.colors.success};
        font-weight: 700;
      }
    }
  }

  /* Styling for the Generate Timetable Banner */
  .generate-banner {
    margin-top: 20px;
    background: linear-gradient(135deg, ${theme.colors.spaceCadet1} 0%, rgba(117, 81, 255, 0.15) 100%);
    border: 1px solid rgba(117, 81, 255, 0.2);
    border-radius: 20px;
    padding: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    ${media.md`
      flex-direction: column;
      align-items: flex-start;
      padding: 24px;
    `}

    .banner-text {
      h2 {
        color: ${theme.colors.white};
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      p {
        color: ${theme.colors.powderBlue};
        font-size: 15px;
        line-height: 1.5;
        max-width: 600px;
      }
    }

    .generate-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: ${theme.colors.majorelleBlue};
      color: ${theme.colors.white};
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 4px 15px rgba(117, 81, 255, 0.4);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(117, 81, 255, 0.6);
      }
    }
  }
`;