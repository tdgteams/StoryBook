import React, { useEffect, useState } from "react";
import {styled} from "styled-components";
import * as XLSX from "xlsx";
import { DocRenderer } from "../..";
import { arrayBufferFileLoader } from "../../utils/fileLoaders";

const MSDocRenderer: DocRenderer = ({ mainState: { currentDocument  } }) => {
  const [content, setContent] = useState<string | string[][]>("");
 
  useEffect(() => {

    console.log("Inside 12 office: ",currentDocument)
    if (!currentDocument?.fileData) return;

    const fileType = currentDocument.fileType?.toLowerCase();

    // Handle XLS/XLSX
    if (fileType === "xls" || fileType === "xlsx" || 
      fileType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileType=="application/vnd.ms-excel") {
      const workbook = XLSX.read(currentDocument.fileData as ArrayBuffer, {
        type: "array",
      });
      const sheetName = workbook.SheetNames[0]; // Use the first sheet
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
      // Explicitly cast rows to string[][], assuming all cells are strings
    setContent(rows.map(row => row.map(cell => String(cell))) as string[][]);
    }
    else {
      setContent("Unsupported file format.");
    }
  }, [currentDocument]);

 
  

  // Handle Excel Table Rendering
  if (Array.isArray(content)) {
    return (
      <Container>
        <Table>
          <thead>
            <tr>
              {content[0]?.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    );
  }

 
  return null;
};

export default MSDocRenderer;

MSDocRenderer.fileTypes = ["xls", "xlsx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel"];
MSDocRenderer.weight = 1;
MSDocRenderer.fileLoader = arrayBufferFileLoader;

const Container = styled.div`
  width: 100%;
  padding: 20px;
  overflow: auto;
  font-family: Arial, sans-serif;
  line-height: 1.5;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th,
  td {
    padding: 8px;
    border: 1px solid #ccc;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  width: 250px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
 
  input {
    flex: 1;
    padding: 6px;
    font-size: 14px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 6px;
  }
 
  button {
    padding: 6px 12px;
    font-size: 14px;
    color: #ffffff;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
 
    &:hover {
      background-color: #0056b3;
    }
  }
`;
