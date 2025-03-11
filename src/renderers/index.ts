import BMPRenderer from "./bmp";
import HTMLRenderer from "./html";
import JPGRenderer from "./jpg";
// import MSDocRenderer from "./msdoc";
// import MyCustomDocxRenderer from "./docx"

//NE-3410 (Anand Mukund) Start
import PDFRenderer from "./pdf";
import PNGRenderer from "./png";
import TIFFRenderer from "./tiff";
import TXTRenderer from "./txt";
import CSVRenderer from "./csv";
import GIFRenderer from "./gif";
import VideoRenderer from "./video";
import WebPRenderer from "./webp";
import { DocumentViewer } from "../DocViewer.stories";
import JsonRenderCon from "./json";
import MSDocRenderer from "./msdoc"
import XMLRenderer from "./xml";

// import MSDocRenderer from "./msdoc";

export const DocViewerRenderers = [
  BMPRenderer,
  HTMLRenderer,
  JPGRenderer,
  PDFRenderer,
  PNGRenderer,
  TIFFRenderer,
  TXTRenderer,
  CSVRenderer,
  GIFRenderer,
  VideoRenderer,
  WebPRenderer,
  JsonRenderCon,
  XMLRenderer,
   MSDocRenderer,
];

export {
  BMPRenderer,
  HTMLRenderer,
  JPGRenderer,
  MSDocRenderer,
  PDFRenderer,
  PNGRenderer,
  TIFFRenderer,
  TXTRenderer,
  CSVRenderer,
  GIFRenderer,
  VideoRenderer,
  WebPRenderer,
  JsonRenderCon,
  XMLRenderer,

 
};
export{ DocumentViewer};
//NE-3410 (Anand Mukund) Start
