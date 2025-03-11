import React from "react";
import styled from "styled-components";
import { DocRenderer, IStyledProps } from "../..";
import { textFileLoader } from "../../utils/fileLoaders";
import { Container as SearchContainer } from "../pdf/components/PDFControls";
import PDFControls from "../pdf/components/PDFControls";
import { PDFProvider } from "../pdf/state";
import XMLPage from "./XMLPage"
 
const XMLRenderer: DocRenderer = ({ mainState }) => {
  return (
    <PDFProvider mainState={mainState}>
      <Container id="txt-renderer">
        <PDFControls />
        <XMLPage />
      </Container>
    </PDFProvider>
  );
};
 
export default XMLRenderer;
 
XMLRenderer.fileTypes = ["xml", "text/xml","application/xml"];
XMLRenderer.weight = 0;
XMLRenderer.fileLoader=textFileLoader;

 
 
// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
 
  &::-webkit-scrollbar {
    ${(props: IStyledProps) => (props.theme.disableThemeScrollbar ? "" : "width: 10px;")}
  }
 
  &::-webkit-scrollbar-track {
    background: ${(props: IStyledProps) => props.theme.secondary};
  }
 
  &::-webkit-scrollbar-thumb {
    background: ${(props: IStyledProps) => props.theme.tertiary};
  }
 
  &::-webkit-scrollbar-thumb:hover {
    background: ${(props: IStyledProps) => props.theme.primary};
  }
`;