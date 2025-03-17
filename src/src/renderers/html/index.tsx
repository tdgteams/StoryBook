import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DocRenderer, IStyledProps } from "../..";
import { textFileLoader } from "../../utils/fileLoaders";
import { Container as SearchContainer } from "../pdf/components/PDFControls";
import PDFControls from "../pdf/components/PDFControls";
import { PDFProvider } from "../pdf/state";
import HTMLRendererPage from "./HTMLRender"
import { dataURLFileLoader } from "../../utils/fileLoaders";

const HTMLRenderer: DocRenderer = ({ mainState }) => {
  //NE-3410 (Anand Mukund) Start
  return (
    < PDFProvider mainState={mainState}>
      <Container id="txt-renderer">
        <PDFControls />
        <HTMLRendererPage />
      </Container>
    </PDFProvider>
  );
  //NE-3410 (Anand Mukund) END
};

export default HTMLRenderer;
HTMLRenderer.fileTypes = ["htm", "html", "text/htm", "text/html", "text/mhtml", "mhtml"];
HTMLRenderer.weight = 0;
HTMLRenderer.fileLoader = dataURLFileLoader;

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  


  /* width */
  &::-webkit-scrollbar {
    ${(props: IStyledProps) => {
    return props.theme.disableThemeScrollbar ? "" : "width: 10px";
  }};
  }
  /* Track */
  &::-webkit-scrollbar-track {
    /* background: ${(props: IStyledProps) => props.theme.secondary}; */
  }
  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: ${(props: IStyledProps) => props.theme.tertiary};
  }
  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: ${(props: IStyledProps) => props.theme.primary};
  }
`;
