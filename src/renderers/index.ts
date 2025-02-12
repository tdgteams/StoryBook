import BMPRenderer from "./bmp";
import HTMLRenderer from "./html";
import JPGRenderer from "./jpg";
// import MSDocRenderer from "./msdoc";
// import MyCustomDocxRenderer from "./docx"
import PDFRenderer from "./pdf";
import PNGRenderer from "./png";
import TIFFRenderer from "./tiff";
import TXTRenderer from "./txt";
import CSVRenderer from "./csv";
import GIFRenderer from "./gif";
import VideoRenderer from "./video";
import WebPRenderer from "./webp";
import { WithPDFInput } from "../DocViewer.stories";

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
  
  // MSDocRenderer,
];

export {
  BMPRenderer,
  HTMLRenderer,
  JPGRenderer,
  // MSDocRenderer,
  PDFRenderer,
  PNGRenderer,
  TIFFRenderer,
  TXTRenderer,
  CSVRenderer,
  GIFRenderer,
  VideoRenderer,
  WebPRenderer,

 
};
export{ WithPDFInput};
