import { IDocument } from "..";

export const getFileName = (
  document: IDocument | undefined,
  retainURLParams: boolean,
): string => {
  if (!document) {
    return "";
  }

  let fileName = "";

  if (document.originalFilename) { 
    fileName = document.originalFilename; //NE-3410 (Anand Mukund)
  } else {
    fileName = document.uri || "";
    fileName = decodeURI(fileName);

    if (!retainURLParams) {
      fileName = fileName?.split("?")?.[0];
    }

    const splitURL = fileName?.split("/");
    if (splitURL.length) {
      fileName = splitURL[splitURL.length - 1];
    }
  }

  return fileName;
};
