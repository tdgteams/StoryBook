import React, { FC, useContext } from "react";
import styled from "styled-components";
import { Button, LinkButton } from "../../../components/common";
import { IStyledProps } from "../../..";
import { PDFContext } from "../state";
import { setPDFPaginated, setZoomLevel } from "../state/actions";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  DownloadPDFIcon,
  ResetZoomPDFIcon,
  TogglePaginationPDFIcon,
  ZoomInPDFIcon,
  ZoomOutPDFIcon,
} from "./icons";
import PDFPagination from "./PDFPagination";

const PDFControls: FC = () => {
  const { t } = useTranslation();
  const {
    state: {
      mainState,
      paginated,
      zoomLevel,
      numPages,
      zoomJump,
      defaultZoomLevel,
    },
    dispatch,
  } = useContext(PDFContext);

  const currentDocument = mainState?.currentDocument || null;
  //NE-3410 (Anand Mukund) Start

  return (
    <Container id="pdf-controls">
      {paginated && numPages > 1 && <PDFPagination />}

      {currentDocument?.fileData && currentDocument.fileName?.includes('.pdf') && (
        <DownloadButton
          id="pdf-download"
          href={currentDocument?.fileData as string}
          download={currentDocument?.fileName || currentDocument?.uri}
          title={t("downloadButtonLabel")}
        >
          <DownloadPDFIcon color="#000" size="75%" />
        </DownloadButton>
      )}

      {currentDocument?.fileData && currentDocument.fileName?.includes('.txt') && (
        <DownloadButton
          id="pdf-download"
          href={URL.createObjectURL(new Blob([currentDocument.fileData], { type: "text/plain" }))}
          download={currentDocument?.fileName || currentDocument?.uri}
          title={t("downloadButtonLabel")}
        >
          <DownloadPDFIcon color="#000" size="75%" />
        </DownloadButton>
      )}

      {currentDocument?.fileData && currentDocument.fileName?.includes('.json') && (
        <DownloadButton
          id="pdf-download"
          href={URL.createObjectURL(new Blob([JSON.stringify(JSON.parse(currentDocument.fileData), null, 2)], { type: "application/json" }))}
          download={currentDocument?.fileName || currentDocument?.uri}
          title={t("downloadButtonLabel")}
        >
          <DownloadPDFIcon color="#000" size="75%" />
        </DownloadButton>
      )}
      {currentDocument?.fileData && (currentDocument.fileName?.includes('.html') || currentDocument.fileName?.includes('.mhtml')) && (
        <DownloadButton
          id="pdf-download"
          href={URL.createObjectURL(new Blob([atob(currentDocument.fileData.replace(/^data:text\/html;base64,/, ""))], { type: "text/html" }))}
          download={currentDocument?.fileName || currentDocument?.uri}
          title={t("downloadButtonLabel")}
        >
          <DownloadPDFIcon color="#000" size="75%" />
        </DownloadButton>
      )}

      {currentDocument?.fileData && currentDocument.fileName?.includes('.csv') && (
        <DownloadButton
          id="pdf-download"
          href={URL.createObjectURL(new Blob([currentDocument.fileData], { type: "text/csv" }))}
          download={currentDocument?.fileName || currentDocument?.uri}
          title={t("downloadButtonLabel")}
        >
          <DownloadPDFIcon color="#000" size="75%" />
        </DownloadButton>
      )}

      {currentDocument?.fileData && (currentDocument.fileName?.includes('.xlsx') || currentDocument.fileName?.includes('.xls')) && (
        <DownloadButton
          id="pdf-download"
          href={URL.createObjectURL(new Blob([currentDocument.fileData], { type: "application/vnd.ms-excel;charset=utf-8" }))}
          download={currentDocument?.fileName || currentDocument?.uri}
          title={t("downloadButtonLabel")}
        >
          <DownloadPDFIcon color="#000" size="75%" />
        </DownloadButton>
      )}
      <ControlButton
        id="pdf-zoom-out"
        onMouseDown={() => dispatch(setZoomLevel(zoomLevel - zoomJump))}
        title="Zoom Out"
      >
        <ZoomOutPDFIcon color="#000" size="80%" />
      </ControlButton>

      <ControlButton
        id="pdf-zoom-in"
        onMouseDown={() => dispatch(setZoomLevel(zoomLevel + zoomJump))}
        title="Zoom In"
      >
        <ZoomInPDFIcon color="#000" size="80%" />
      </ControlButton>

      <ControlButton
        id="pdf-zoom-reset"
        onMouseDown={() => dispatch(setZoomLevel(defaultZoomLevel))}
        disabled={zoomLevel === defaultZoomLevel}
        title="Reset"
      >
        <ResetZoomPDFIcon color="#000" size="70%" />
      </ControlButton>

      {numPages > 1 && (
        <ControlButton
          id="pdf-toggle-pagination"
          onMouseDown={() => dispatch(setPDFPaginated(!paginated))}
          title="Toggle Pagination"
        >
          <TogglePaginationPDFIcon
            color="#000"
            size="70%"
            reverse={paginated}
          />
        </ControlButton>
      )}

    </Container>
  );
};
//NE-3410 (Anand Mukund) END
export default PDFControls;

const Container = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  justify-content: flex-end;
  padding: 8px;
  background-color: ${(props: IStyledProps) => props.theme.tertiary};
  box-shadow: 0px 2px 3px #00000033;
 
  @media (max-width: 768px) {
    padding: 6px;
  }
`;

export const ControlButton = styled(Button)`
  width: 30px;
  height: 30px;
  @media (max-width: 768px) {
    width: 25px;
    height: 25px;
  }
`;

const DownloadButton = styled(LinkButton)`
  width: 30px;
  height: 30px;
  @media (max-width: 768px) {
    width: 25px;
    height: 25px;
  }
`;
