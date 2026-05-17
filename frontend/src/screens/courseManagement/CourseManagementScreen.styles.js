import styled from "styled-components";
import { theme, media } from "../../styles/theme/theme";

export const CourseManagement = styled.div`
  background-color: transparent;
  
  .screen-header {
    margin-bottom: 24px;
    
    h1 {
      color: ${theme.colors.white};
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;

      /* Responsive font sizes */
      ${media.lg`
        font-size: 28px;
      `}

      ${media.sm`
        font-size: 24px;
      `}
    }
    
    p {
      color: ${theme.colors.powderBlue};
      font-size: 16px;

      /* Responsive font sizes */
      ${media.sm`
        font-size: 14px;
      `}
    }
  }

  .table-container {
    width: 100%;
    margin-bottom: 20px; 
  }
`;