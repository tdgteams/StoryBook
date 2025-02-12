/* eslint-disable */
import React, { FC, useContext, useEffect,useCallback ,useState} from "react";
import { Document } from "react-pdf";
import styled from "styled-components";
import { useTranslation } from "../../../../hooks/useTranslation";
import { PDFContext } from "../../state";
import { setNumPages } from "../../state/actions";
import { initialPDFState } from "../../state/reducer";
import { PDFAllPages } from "./PDFAllPages";
import PDFSinglePage from "./PDFSinglePage";
import { Container,ControlButton } from "../PDFControls";

const PDFPages: FC<{}> = () => {
  
  const [searchText, setSearchText] = useState('');
  const {
    state: { mainState, paginated },
    dispatch,
  } = useContext(PDFContext);
  const { t } = useTranslation();
  const currentDocument = mainState?.currentDocument || null;
  let highlightedWords=currentDocument?.highlightedWords?currentDocument.highlightedWords:[];
  console.log("highlight "+currentDocument?.highlightedWords);

  function highlightPattern(text:string, pattern:string) {
    if(!text)
      return text;
    if(pattern){
    text= text.replace(pattern, (value) => `<mark>${value}</mark>`);
    }
    if(highlightedWords && highlightedWords.length>0){
    const regex=new RegExp(`(${highlightedWords.join('|')})`,'gi');
    text= text.replace(regex,(value) => `<mark>${value}</mark>`);
  }
    return text;
  }

  const textRenderer = useCallback(
    (textItem:any) => highlightPattern(textItem.str, searchText),
    [searchText,highlightedWords]
  );
  function onChange(event:any) {
    setSearchText(event.target.value);
  }
  


  useEffect(() => {
    dispatch(setNumPages(initialPDFState.numPages));
  }, [currentDocument]);

  if (!currentDocument || currentDocument.fileData === undefined) return null;

  return (
    <>
    <Container id="pdf-controls">
    <label htmlFor="search">Search:</label>
    <input type="search" id="search" value={searchText} onChange={onChange} />  
    </Container>
   
    <DocumentPDF 
      file={currentDocument.fileData}
      onLoadSuccess={({ numPages }) => dispatch(setNumPages(numPages))}
      loading={<span>{t("pdfPluginLoading")}</span>}
    >
      {paginated ? <PDFSinglePage textRenderer={textRenderer} /> : <PDFAllPages textRenderer={textRenderer}/>}
      
    </DocumentPDF>
    </>
  );
};

const DocumentPDF = styled(Document)`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  font-size:26px;
`;

export default PDFPages;
