import styled from "styled-components";

export const SummaryWrap = styled.div`
  .dash-board-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* --- Top 4 Metric Blocks --- */
  .dboard-summary-blocks {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }

  .dboard-block {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .summary-block-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: rgba(67, 97, 238, 0.1); /* Soft primary blue */
    color: #4361ee;
    font-size: 28px;
  }

  .summary-block-details {
    display: flex;
    flex-direction: column;
  }

  .summary-block-ttl {
    font-size: 14px;
    color: #888;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .summary-block-val {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin-bottom: 4px;
  }

  .summary-block-text {
    font-size: 13px;
    color: #666;

    .text-percent {
      font-weight: 600;
      color: #4CAF50; /* Green highlight for percentages/capacity */
    }
  }

  /* --- The Generation Banner --- */
  .generate-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    padding: 28px;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 12px;
    color: #ffffff;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .banner-text {
    max-width: 600px;
    
    h2 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #ffffff;
    }

    p {
      font-size: 15px;
      color: #cbd5e1;
      line-height: 1.5;
    }
  }

  /* --- Banner Buttons --- */
  .generate-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #4CAF50; /* Green for GO */
    color: white;
    font-size: 16px;
    font-weight: 600;
    padding: 14px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
    transition: all 0.2s ease;

    &:hover {
      background-color: #43a047;
      transform: scale(1.02);
    }
  }

  .reset-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: rgba(239, 68, 68, 0.1); /* Transparent Red */
    color: #ef4444; /* Red text */
    font-size: 15px;
    font-weight: 600;
    padding: 12px 20px;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #ef4444;
      color: white;
    }
  }

  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .generate-banner {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .generate-btn, .reset-btn {
      width: 100%;
      justify-content: center;
    }
  }
`;