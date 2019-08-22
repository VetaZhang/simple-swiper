import styled from "styled-components";

export const StyledSwiper = styled.div`
  overflow: hidden;
`;

export const StyledContent = styled.div`
  & > * {
    display: inline-block;
    white-space: normal;
  }
  position: relative;
  height: 100%;
  white-space: nowrap;
  overflow: hidden;
`;
