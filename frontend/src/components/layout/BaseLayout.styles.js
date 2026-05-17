import styled from "styled-components";
import { theme, media } from "../../styles/theme/theme";

export const BaseLayoutWrap = styled.div`
    display: flex;
    width: 100%;
    min-height: 100vh;
    color: ${theme.colors.white};

    .main-content-wrapper{
        /* Reduced the horizontal padding from 20px to 10px here */
        padding: 32px 10px; 
        margin-left: 260px;
        flex: 1;

        ${media.xxl`
            margin-left: 260px;
            padding: 32px 16px;
        `}

        ${media.xl`
            margin-left: 72px;
            padding: 24px 16px;
        `}

        ${media.md`
            margin-left: 0;
        `}
    }
`;