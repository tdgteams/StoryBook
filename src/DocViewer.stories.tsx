import React, { useRef, useState ,useEffect} from "react";
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
const noNeedOfPdfConversion = new Set(["csv","xlsx","xls","pdf","text/csv","application/pdf","htm", "html", "text/htm", "text/html","text/plain","txt"]);

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
  additionalDetails: [{
    baseUrl:string,
    isClickable:boolean,
    highlightedWords:string[]
    

  }]
}
 
export const WithPDFInput: React.FC<WithPDFInputProps> = ({ documents,additionalDetails }) => {
  const [newDocs, setNewDocs] = useState<File[]>([]);
 
  useEffect(() => {
    if (documents && documents.length > 0) {
      handleConvert(documents);
    }
  }, [documents]);
 
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
        const formData = new FormData();
        formData.append('file', file);

        const fileType=file.type;
        if(noNeedOfPdfConversion.has(fileType))
        {
          arr.push(file);
          continue;
        }
        
        console.log("start time", new Date());
 
const convertResponse = await fetch('http://localhost:3000/convert', {
          method: 'POST',
          body: formData,
        });
 
        if (convertResponse.ok) {
          const convertedBlob = await convertResponse.blob();
          console.log("End time", new Date());
 
          // Convert the Blob into a File instance
          const convertedFile = new File([convertedBlob], `${file.name.split('.').slice(0, -1).join('.')}.pdf`, {
            type: 'application/pdf',
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
            baseUrl:additionalDetails?additionalDetails[0].baseUrl:undefined,
            isClickable:additionalDetails?additionalDetails[0].isClickable:false,
            highlightedWords:additionalDetails?additionalDetails[0].highlightedWords:[],
          }))}
          pluginRenderers={DocViewerRenderers}
        />
      )}
    </>
  );
};

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
