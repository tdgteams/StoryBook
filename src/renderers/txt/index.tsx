import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DocRenderer,IStyledProps } from "../..";
import { textFileLoader } from "../../utils/fileLoaders";
import { Container as SearchContainer } from "../pdf/components/PDFControls";
import PDFControls from "../pdf/components/PDFControls";
import { PDFProvider } from "../pdf/state";
import TXTRendererCon from "./TextPages";
 
const TXTRenderer: DocRenderer = ({ mainState }) => {
  
  return (
    < PDFProvider mainState={mainState}>
    <Container id="txt-renderer">
    <PDFControls />
    <TXTRendererCon/>
    </Container>
    </PDFProvider>
  );
};
 
export default TXTRenderer;
 
TXTRenderer.fileTypes = ["txt", "text/plain"];
TXTRenderer.weight = 0;
TXTRenderer.fileLoader = textFileLoader;
 
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
