import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DocRenderer, IStyledProps } from "../..";
import { textFileLoader } from "../../utils/fileLoaders";
import PDFControls from "../pdf/components/PDFControls";
import { PDFProvider } from "../pdf/state";
import { dataURLFileLoader } from "../../utils/fileLoaders";
import CSVRendererPage from "./CSVRenderer";

const CSVRenderer: DocRenderer = ({ mainState }) => {
  //NE-3410 (Anand Mukund) Start
  return (
    < PDFProvider mainState={mainState}>
      <Container id="txt-renderer">
        <PDFControls />
        <CSVRendererPage />
      </Container>
    </PDFProvider>
  );
};

export default CSVRenderer;
CSVRenderer.fileTypes = ["csv", "text/csv"];
CSVRenderer.weight = 0;
CSVRenderer.fileLoader = textFileLoader;

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
//NE-3410 (Anand Mukund) END