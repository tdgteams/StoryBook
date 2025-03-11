import React from "react";
import styled from "styled-components";
import { DocRenderer, IStyledProps } from "../..";
import { textFileLoader } from "../../utils/fileLoaders";
import { Container as SearchContainer } from "../pdf/components/PDFControls";
import PDFControls from "../pdf/components/PDFControls";
import { PDFProvider } from "../pdf/state";
import JSONRenderer from "./JsonRender"
 
const JsonRenderCon: DocRenderer = ({ mainState }) => {
  return (
    <PDFProvider mainState={mainState}>
      <Container id="txt-renderer">
        <PDFControls />
        <JSONRenderer />
      </Container>
    </PDFProvider>
  );
};
 
export default JsonRenderCon;
 
JsonRenderCon.fileTypes = ["json", "jsonl","application/json"];
JsonRenderCon.weight = 0;
JsonRenderCon.fileLoader=textFileLoader;
 
 
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