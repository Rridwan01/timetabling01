import styled, { keyframes } from "styled-components";
import { theme, media } from "../../styles/theme/theme";
import { BlockWrapStyles } from "../../styles/global/default";

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(117, 81, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(117, 81, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(117, 81, 255, 0); }
`;

export const GenerateWrap = styled.div`
  background-color: transparent;

  .screen-header {
    margin-bottom: 24px;
    
    h1 {
      color: ${theme.colors.white};
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      ${media.lg` font-size: 28px; `}
      ${media.sm` font-size: 24px; `}
    }
    
    p {
      color: ${theme.colors.powderBlue};
      font-size: 16px;
      ${media.sm` font-size: 14px; `}
    }
  }

  .engine-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 20px;

    ${media.xl`
      grid-template-columns: 1fr;
    `}
  }

  .config-panel {
    ${BlockWrapStyles}
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: fit-content;

    .panel-title {
      font-size: 18px;
      font-weight: 700;
      color: ${theme.colors.white};
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-size: 14px;
        color: ${theme.colors.powderBlue};
        font-weight: 500;
      }

      select, input {
        background-color: ${theme.colors.oxfordBlue};
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: ${theme.colors.white};
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: ${theme.transitions.easeInOut};

        &:focus {
          border-color: ${theme.colors.majorelleBlue};
        }
      }

      select option {
        background-color: ${theme.colors.spaceCadet1};
      }
    }

    .run-btn {
      margin-top: 10px;
      background-color: ${theme.colors.majorelleBlue};
      color: ${theme.colors.white};
      padding: 16px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s ease;

      &:hover { opacity: 0.9; }

      &.running {
        background-color: ${theme.colors.warning};
        color: ${theme.colors.spaceCadet1};
        animation: ${pulse} 1.5s infinite;
      }

      &.completed {
        background-color: ${theme.colors.success};
      }
      
      &:disabled {
        cursor: not-allowed;
        opacity: 0.8;
      }
    }
  }

  .execution-panel {
    ${BlockWrapStyles}
    display: flex;
    flex-direction: column;
    gap: 24px;

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      ${media.sm` grid-template-columns: 1fr; `}

      .metric-card {
        background-color: ${theme.colors.oxfordBlue};
        padding: 16px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);

        .metric-lbl {
          font-size: 13px;
          color: ${theme.colors.powderBlue};
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-val {
          font-size: 28px;
          font-weight: 700;
          color: ${theme.colors.white};
          
          &.highlight {
            color: ${theme.colors.success};
          }
        }
      }
    }

    .progress-section {
      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
      }

      .progress-track {
        width: 100%;
        height: 12px;
        background-color: ${theme.colors.oxfordBlue};
        border-radius: 100vh;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, ${theme.colors.majorelleBlue}, ${theme.colors.pictonBlue});
          border-radius: 100vh;
          transition: width 0.3s ease;
        }
      }
    }

    .terminal-window {
      flex: 1;
      min-height: 250px;
      background-color: #050a1f; /* Deeper dark for terminal */
      border-radius: 12px;
      padding: 16px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      color: #a3aed0;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
      gap: 6px;

      .log-line {
        line-height: 1.4;
        
        .timestamp { color: #61b7e1; margin-right: 10px; }
        &.info { color: #a3aed0; }
        &.success { color: #01b574; font-weight: bold;}
        &.warning { color: #ffce20; }
        &.error { color: #ee5d50; }
      }
    }
  }
`;