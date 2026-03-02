import styled from "styled-components";
import { BlockWrapStyles } from "../../../../styles/global/default";
import { theme, media } from "../../../../styles/theme/theme";

export const RoomTableWrap = styled.div`
  ${BlockWrapStyles}

  .room-table-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
    
    ${media.sm`
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    `}

    .head-ttl {
      font-size: 24px;
      ${media.sm` font-size: 20px; `}
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: ${theme.colors.majorelleBlue};
      color: ${theme.colors.white};
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 500;
      font-size: 14px;

      &:hover { opacity: 0.9; }
      
      ${media.sm`
        width: 100%;
        justify-content: center;
      `}
    }
  }

  /* FORM STYLES */
  .room-form {
    background-color: ${theme.colors.delftBlue};
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 24px;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      /* Spans across full width to keep it balanced */
      .availability-group {
        grid-column: span 2;
      }

      ${media.md` 
        grid-template-columns: 1fr; 
        .availability-group {
          grid-column: span 1;
        }
      `}
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

      input, select {
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
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
      }

      /* Fix dropdown option styling inside dark mode */
      select option {
        background-color: ${theme.colors.spaceCadet1};
        color: ${theme.colors.white};
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;

      button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
      }

      .save-btn {
        background-color: ${theme.colors.success};
        color: ${theme.colors.white};
        &:hover { opacity: 0.9; }
      }

      .cancel-btn {
        background-color: ${theme.colors.spaceCadet1};
        color: ${theme.colors.powderBlue};
        border: 1px solid rgba(255, 255, 255, 0.1);
        &:hover {
          color: ${theme.colors.white};
          background-color: rgba(255, 255, 255, 0.05);
        }
      }
    }
  }

  /* TABLE STYLES */
  .room-table-content {
    .table-block {
      overflow-x: auto;

      table {
        tbody {
          tr {
            .status-badge {
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              
              &.status-available {
                background-color: rgba(1, 181, 116, 0.1);
                color: ${theme.colors.success};
              }
              
              &.status-maintenance {
                background-color: rgba(255, 206, 32, 0.1);
                color: ${theme.colors.warning};
              }
            }

            .data-cell-actions {
              display: flex;
              align-items: center;
              gap: 16px;

              button {
                color: ${theme.colors.powderBlue};
                transition: ${theme.transitions.easeInOut};
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover { color: ${theme.colors.white}; }
                &.delete-btn:hover { color: ${theme.colors.danger}; }
                &.edit-btn:hover { color: ${theme.colors.pictonBlue}; }
              }
            }
          }
        }
      }
    }
  }
`;