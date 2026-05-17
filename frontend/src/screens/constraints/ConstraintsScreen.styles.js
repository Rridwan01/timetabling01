import styled from "styled-components";
import { theme, media } from "../../styles/theme/theme";
import { BlockWrapStyles } from "../../styles/global/default";

export const ConstraintsWrap = styled.div`
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

  .constraints-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    ${media.lg`
      grid-template-columns: 1fr;
    `}
  }

  .constraint-card {
    ${BlockWrapStyles}
    display: flex;
    flex-direction: column;

    &.full-width {
      grid-column: span 2;
      ${media.lg` grid-column: span 1; `}
    }

    .card-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      color: ${theme.colors.white};
    }
  }

  /* Setting Row Styles */
  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &:last-child {
      border-bottom: none;
    }

    .setting-info {
      max-width: 75%;
      
      .setting-name {
        font-size: 15px;
        font-weight: 600;
        color: ${theme.colors.white};
        margin-bottom: 4px;
      }
      
      .setting-desc {
        font-size: 13px;
        color: ${theme.colors.powderBlue};
      }
    }

    /* Custom Input Styles */
    .setting-input {
      width: 80px;
      background-color: ${theme.colors.oxfordBlue};
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: ${theme.colors.white};
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 14px;
      text-align: center;
      outline: none;
      transition: ${theme.transitions.easeInOut};

      &:focus {
        border-color: ${theme.colors.majorelleBlue};
      }
    }

    .setting-select {
      background-color: ${theme.colors.oxfordBlue};
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: ${theme.colors.white};
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 14px;
      outline: none;

      option {
        background-color: ${theme.colors.spaceCadet1};
      }
    }
  }

  /* Custom Toggle Switch */
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 46px;
    height: 26px;

    input {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .slider {
        background-color: ${theme.colors.majorelleBlue};
      }

      &:checked + .slider:before {
        transform: translateX(20px);
      }
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.1);
      transition: 0.4s;
      border-radius: 34px;

      &:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
      }
    }
  }

  /* Save Action Area */
  .action-area {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;

    .save-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: ${theme.colors.success};
      color: ${theme.colors.white};
      padding: 14px 24px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;

      &:hover {
        opacity: 0.9;
        transform: translateY(-2px);
      }
    }
  }
`;