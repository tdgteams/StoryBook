import React, { useRef, useState, useEffect } from "react";
import DocViewer from "./DocViewer";
import { DocViewerRenderers } from "./renderers";

import pdfFile from "./exampleFiles/pdf-file.pdf";
import pdfMultiplePagesFile from "./exampleFiles/pdf-multiple-pages-file.pdf";
import pngFile from "./exampleFiles/png-image.png?url";
import csvFile from "./exampleFiles/csv-file.csv?url";
import epsFile from "./exampleFiles/eps-file.eps?url";
import webpFile from "./exampleFiles/webp-file.webp?url";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { removeStopwords } from 'stopword'

import { DocViewerRef, IDocument } from ".";

export default {
  title: "DocViewer",
};

const docs: IDocument[] = [
  { uri: pdfFile },
  { uri: pngFile },
  { uri: csvFile },
  { uri: pdfMultiplePagesFile },
  { uri: webpFile },
];
const noNeedOfPdfConversion = new Set(["csv", "text/csv", "xlsx", "xls", "pdf", "text/csv", "application/pdf", "mhtml", "htm", "html", "text/htm", "text/html", "text/plain", "txt", "json", "application/json", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xls", "xml", "application/xml", "text/xml", "htm", "html", "text/htm", "text/html", "text/mhtml", "mhtml"]);
// const noNeedOfPdfConversion = new Set(["csv","xlsx","xls","pdf","text/csv","pdf","application/pdf","htm", "html", "text/htm", "text/html","mhtml"]);

//NE-3410 (Anand Mukund) Start
export const Default = () => (
  <DocViewer
    documents={docs}
    initialActiveDocument={docs[1]}
    config={{
      noRenderer: {
        overrideComponent: ({ document, fileName }) => {
          const fileText = fileName || document?.fileType || "";
          console.log(document);
          if (fileText) {
            return <div>no renderer for {fileText}</div>;
          }
          return <div>no renderer</div>;
        },
      },
      loadingRenderer: {
        overrideComponent: ({ document, fileName }) => {
          const fileText = fileName || document?.fileType || "";
          if (fileText) {
            return <div>loading ({fileText})</div>;
          }
          return <div>loading</div>;
        },
      },
      csvDelimiter: ",",
      pdfZoom: {
        defaultZoom: 1.1,
        zoomJump: 0.2,
      },
      pdfVerticalScrollByDefault: true,
    }}
    language="pl"
  />
);






interface WithPDFInputProps {
  documents: File[]; // Array of file URIs
  additionalInput: [{
    baseUrl: string,
    isClickable: boolean,
    highlightingToken: string,
    splitHighlightingTokens: boolean


  }]
}

export const DocumentViewer: React.FC<WithPDFInputProps> = ({ documents, additionalInput }) => {
  const [newDocs, setNewDocs] = useState<File[]>([]);
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);

  useEffect(() => {
    if (documents && documents.length > 0) {
      handleConvert(documents);
      getHighlightingWords(additionalInput);
    }
  }, [documents]);

  const getHighlightingWords = (additionalDetails: WithPDFInputProps["additionalInput"]) => {
    const highlightingToken = additionalDetails ? additionalDetails[0]?.highlightingToken : undefined;
    let highlitedWordsToDisplay: string[] = [];
    if (highlightingToken && highlightingToken.trim().length > 0) {
      if (additionalDetails[0].splitHighlightingTokens) {
        const words = highlightingToken.trim().split(' ');
        highlitedWordsToDisplay = removeStopwords(words);
      }
      highlitedWordsToDisplay.push(highlightingToken.trim());
    }
    setHighlightedWords(highlitedWordsToDisplay);
  }
  const handleConvert = async (documentUris: File[]) => {
    setNewDocs([]);
    console.log('inside convert');
    const arr: File[] = [];

    if (!documentUris || documentUris.length === 0) {
      alert('Please provide valid file URIs');
      return;
    }

    for (const file of documentUris) {
      try {
        const fileType = file.type;
        console.log("type: " + fileType);
        if (noNeedOfPdfConversion.has(fileType)) {
          arr.push(file);
          continue;
        }
        console.log('started');
        const formData = new FormData();
        formData.append('file', file);
        let uri = 'https://libreoffice-3rdidocviewer.thedigitalgroup.com/convert';
        let fileExtension = 'pdf';
        let convertResponse;
        let type = 'application/pdf';
        if (file.name.includes('.xpt')) {
          fileExtension = 'csv';
          uri = 'https://libreoffice-3rdidocviewer.thedigitalgroup.com/convert/xpt-to-csv';
          type = 'text/csv';
        }
        else if (file.name.includes('.eml') || file.name.includes('.msg')) {
          uri = 'https://libreoffice-3rdidocviewer.thedigitalgroup.com/convert/eml-to-pdf'
        }
        console.log("start time", new Date());

        convertResponse = await fetch(uri, {
          method: 'POST',
          body: formData,
        });

        if (convertResponse.ok) {
          const convertedBlob = await convertResponse.blob();
          console.log("End time", new Date());

          // Convert the Blob into a File instance
          const convertedFile = new File([convertedBlob], `${file.name.split('.').slice(0, -1).join('.')}.${fileExtension}`, {
            type: type,
          });

          arr.push(convertedFile);
        }
      } catch (error) {
        console.error('Error processing file URI:', error);
        alert('Error processing file URI');
      }
    }

    setNewDocs(arr);
  };

  return (
    <>
      {/* Render the documents in DocViewer */}

      {newDocs.length > 0 && (
        <DocViewer
          documents={newDocs.map((file) => ({
            uri: window.URL.createObjectURL(file),
            fileName: file.name,
            baseUrl: additionalInput ? additionalInput[0].baseUrl : undefined,
            isClickable: additionalInput ? additionalInput[0].isClickable : false,
            highlightedWords: highlightedWords,
            originalFilename: documents[0].name,
          }))}
          pluginRenderers={DocViewerRenderers}
        />
      )}
    </>
  );
};
//NE-3410 (Anand Mukund) END
export const ManualNextPrevNavigation = () => {
  const [activeDocument, setActiveDocument] = useState(docs[0]);

  const handleDocumentChange = (document: IDocument) => {
    setActiveDocument(document);
  };

  return (
    <>
      <DocViewer
        documents={docs}
        activeDocument={activeDocument}
        onDocumentChange={handleDocumentChange}
      />
    </>
  );
};

export const WithRef = () => {
  const docViewerRef = useRef<DocViewerRef>(null);

  return (
    <>
      <div>
        <button onClick={() => docViewerRef?.current?.prev()}>
          Prev Document By Ref
        </button>
        <button onClick={() => docViewerRef?.current?.next()}>
          Next Document By Ref
        </button>
      </div>
      <DocViewer
        ref={docViewerRef}
        documents={docs}
        config={{ header: { disableHeader: true } }}
      />
    </>
  );
};

export const NoRenderType = () => {
  const docs = [{ uri: epsFile, fileType: "application/postscript" }];

  return (
    <DocViewer
      documents={docs}
      initialActiveDocument={docs[0]}
      pluginRenderers={DocViewerRenderers}
      language="en"
    />
  );
};
