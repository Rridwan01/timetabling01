import styled from "styled-components";
import { theme, media } from "../../styles/theme/theme";

export const RoomManagement = styled.div`
  overflow-y: auto;
  background-color: transparent;
  
  .screen-header {
    margin-bottom: 24px;
    
    p {
      color: ${theme.colors.powderBlue};
      font-size: 16px;

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