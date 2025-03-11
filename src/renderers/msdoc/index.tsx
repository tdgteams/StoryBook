import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DocRenderer, IStyledProps } from "../..";
import { textFileLoader } from "../../utils/fileLoaders";
import PDFControls from "../pdf/components/PDFControls";
import { PDFProvider } from "../pdf/state";
import ExcelRenderer from "./ExelRenderer";
import { arrayBufferFileLoader } from "../../utils/fileLoaders";

const MSDocRenderer: DocRenderer = ({ mainState }) => {
  //NE-3410 (Anand Mukund) Start
  return (
    < PDFProvider mainState={mainState}>
      <Container id="txt-renderer">
        <PDFControls />
        <ExcelRenderer />
      </Container>
    </PDFProvider>
  );
  //NE-3410 (Anand Mukund) END
};




export default MSDocRenderer;

MSDocRenderer.fileTypes = [
  "xls",
  "xlsx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
MSDocRenderer.weight = 1;
MSDocRenderer.fileLoader = arrayBufferFileLoader;

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



