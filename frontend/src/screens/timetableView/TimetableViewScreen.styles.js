import styled from "styled-components";
import { theme, media } from "../../styles/theme/theme";
import { BlockWrapStyles } from "../../styles/global/default";

export const TimetableViewWrap = styled.div`
  background-color: transparent;

  /* Header & Export Actions */
  .screen-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
    
    .header-text {
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

    .export-actions {
      display: flex;
      gap: 12px;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        transition: ${theme.transitions.easeInOut};

        &.btn-csv {
          background-color: ${theme.colors.spaceCadet2};
          color: ${theme.colors.white};
          border: 1px solid rgba(255, 255, 255, 0.1);
          
          &:hover { background-color: rgba(255, 255, 255, 0.1); }
        }

        &.btn-pdf {
          background-color: ${theme.colors.majorelleBlue};
          color: ${theme.colors.white};
          
          &:hover { opacity: 0.9; }
        }
      }
    }
  }

  /* Algorithm Performance Comparison */
  .performance-comparison {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 24px;

    ${media.lg` grid-template-columns: 1fr; `}

    .perf-card {
      ${BlockWrapStyles}
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .perf-title {
        font-size: 16px;
        font-weight: 600;
        color: ${theme.colors.powderBlue};
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .perf-stats {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .stat-group {
          display: flex;
          flex-direction: column;

          .stat-val {
            font-size: 24px;
            font-weight: 700;
            color: ${theme.colors.white};
            
            &.winner { color: ${theme.colors.success}; }
            &.loser { color: ${theme.colors.warning}; }
          }
          .stat-lbl {
            font-size: 12px;
            color: ${theme.colors.powderBlue};
          }
        }
      }
    }

    .perf-summary-card {
      background: linear-gradient(135deg, ${theme.colors.spaceCadet2} 0%, rgba(117, 81, 255, 0.2) 100%);
      border: 1px solid rgba(117, 81, 255, 0.3);
      
      .summary-text {
        font-size: 14px;
        line-height: 1.6;
        color: ${theme.colors.white};
        opacity: 0.9;
      }
    }
  }

  /* Timetable Data Section */
  .timetable-container {
    ${BlockWrapStyles}

    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .view-toggles {
        display: flex;
        background-color: ${theme.colors.oxfordBlue};
        border-radius: 8px;
        overflow: hidden;

        button {
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: ${theme.colors.powderBlue};
          font-weight: 500;
          font-size: 14px;

          &.active {
            background-color: ${theme.colors.majorelleBlue};
            color: ${theme.colors.white};
          }
        }
      }
    }

    .table-block {
      overflow-x: auto;

      table {
        width: 100%;
        border-collapse: collapse;

        thead th {
          text-align: left;
          color: ${theme.colors.powderBlue};
          font-size: 13px;
          text-transform: uppercase;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          transition: ${theme.transitions.easeInOut};

          &:hover {
            background-color: rgba(255, 255, 255, 0.02);
          }

          td {
            padding: 14px 16px;
            font-size: 14px;
            color: ${theme.colors.white};
            vertical-align: middle;

            .course-code {
              font-weight: 700;
              color: ${theme.colors.pictonBlue};
              display: block;
              margin-bottom: 2px;
            }
            .course-title {
              font-size: 12px;
              color: ${theme.colors.powderBlue};
            }
          }

          /* CONFLICT ROW STYLING */
          &.conflict-row {
            background-color: rgba(238, 93, 80, 0.08);
            border-left: 4px solid ${theme.colors.danger};

            td {
              .conflict-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background-color: rgba(238, 93, 80, 0.2);
                color: ${theme.colors.danger};
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                margin-top: 4px;
              }
            }
          }
        }
      }
    }
  }
`;