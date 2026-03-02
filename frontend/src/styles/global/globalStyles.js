import { createGlobalStyle } from "styled-components";
import { theme } from "../theme/theme";

export const GlobalStyles = createGlobalStyle`
    *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: inherit;
    }
    html{
        scroll-behavior: smooth;
    }
    body{
        font-family: ${theme.typography.fontFamily};
        font-weight: ${theme.typography.fontWeight};
        font-size: ${theme.typography.fontSize};
        line-height: ${theme.typography.lineHeight};
        background: ${theme.colors.oxfordBlue};
    }
    ul{
        list-style: none;
    }
    img{
        width: 100%;
        display: block;
        max-width: 100%;
    }
    a{
        color: unset;
        text-decoration: none;
        transition: ${theme.transitions.easeInOut};
    }

    button{
        border: none;
        cursor: pointer;
        background: transparent;
        transition: ${theme.transitions.easeInOut};
        outline: 0;

        &:hover{
            opacity: 0.9;
        }
    }

    /* --- CUSTOM GLOBAL SELECT DROPDOWN --- */
    select {
        appearance: none; /* Removes native OS styling */
        -webkit-appearance: none; /* Safari/Chrome */
        -moz-appearance: none; /* Firefox */
        
        /* Custom sleek SVG arrow */
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23A3AED0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
        background-repeat: no-repeat;
        background-position: right 14px center; /* Position the arrow */
        background-size: 16px;
        padding-right: 40px !important; /* Make room for the arrow so text doesn't overlap */
        cursor: pointer;
    }

    /* Removes default arrow in Internet Explorer */
    select::-ms-expand {
        display: none;
    }

    /* Forces dark theme on the dropdown options */
    select option {
        background-color: ${theme.colors.spaceCadet1};
        color: ${theme.colors.white};
        padding: 10px;
    }
    /* ------------------------------------- */

    .scrollbar{
        &::-webkit-scrollbar{
            width: 6px;
            height: 6px;
        }
        &::-webkit-scrollbar-track{
            background-color: transparent;
        }
        &::-webkit-scrollbar-thumb{
            border-radius: 100vh!important;
            background-color: ${theme.colors.majorelleBlue};
            outline: 1px solid rgba(0, 0, 0, 0.02);
            outline-offset: -1px;
        }
    }

    .recharts-default-tooltip, .custom-recharts-tooltip{
        padding: 4px 8px!important;
        box-shadow: rgba(0, 0, 0, 0.26) 0 8px 60px 4px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
        background: ${theme.colors.spaceCadet2}!important;
    }

    .recharts-tooltip-item-list{
        *, li{
            font-size: 13px;
            font-family: inherit !important;
            opacity: 0.9;
            color: ${theme.colors.white}!important;
            text-transform: capitalize;
        }
    }

    .recharts-tooltip-label{
        color: ${theme.colors.white}!important;
        font-size: 14px;
        font-weight: 600;
    }
`;