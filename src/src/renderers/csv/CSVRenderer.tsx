import React, { useEffect, useState, useCallback, FC, useContext, useRef } from "react";
import styled from "styled-components";
import { PDFContext } from "../pdf/state";
import { useTranslation } from "../../hooks/useTranslation";
import { ChevronUp, ChevronDown } from "lucide-react"; // Imported arrow icons
import papaparse from "papaparse";

//NE-3410 (Anand Mukund) Start
const CSVRendererPage: FC<{}> = () => {
  const {
    state: { mainState, zoomLevel },
  } = useContext(PDFContext);
  const { t } = useTranslation();
  const currentDocument = mainState?.currentDocument;
  const config = mainState?.config;
  const [rows, setRows] = useState<string[][]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMatches, setSearchMatches] = useState<{ row: number; col: number }[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const searchRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (currentDocument?.fileData) {
      const parseResult = papaparse.parse(currentDocument.fileData as string, {
        delimiter: config?.csvDelimiter ?? ",",
      });

      if (!parseResult.errors?.length && parseResult.data) {
        setRows(parseResult.data as string[][]);
      }
    }
  }, [currentDocument, config?.csvDelimiter]);

  useEffect(() => {
    if (!searchTerm) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const matches: { row: number; col: number }[] = [];

    rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    setSearchMatches(matches);
    setCurrentMatchIndex(0);
  }, [searchTerm, rows]);

  useEffect(() => {
    if (searchMatches.length > 0 && searchRefs.current[currentMatchIndex]) {
      searchRefs.current[currentMatchIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentMatchIndex, searchMatches]);

  const moveToMatch = (direction: "next" | "prev") => {
    if (searchMatches.length === 0) return;

    setCurrentMatchIndex((prevIndex) => {
      if (direction === "next") {
        return (prevIndex + 1) % searchMatches.length;
      } else {
        return (prevIndex - 1 + searchMatches.length) % searchMatches.length;
      }
    });
  };

  const highlightText = (text: string, rowIndex: number, colIndex: number) => {
    const highlightWords = currentDocument?.highlightedWords || [];
    let parts = [text];

    // First, highlight predefined words in green
    highlightWords.forEach((word) => {
      parts = parts.flatMap((part) =>
        typeof part === "string"
          ? part.split(new RegExp(`(${word})`, "gi")).map((segment, index) =>
            segment.toLowerCase() === word.toLowerCase() ? (
              <span key={`green-${segment}-${index}`} className="highlight-green">
                {segment}
              </span>
            ) : (
              segment
            )
          )
          : part
      );
    });

    // Then, highlight search term
    if (searchTerm) {
      parts = parts.flatMap((part) =>
        typeof part === "string"
          ? part.split(new RegExp(`(${searchTerm})`, "gi")).map((segment, index) => {
            const isCurrent =
              searchMatches[currentMatchIndex]?.row === rowIndex &&
              searchMatches[currentMatchIndex]?.col === colIndex &&
              segment.toLowerCase() === searchTerm.toLowerCase();

            return segment.toLowerCase() === searchTerm.toLowerCase() ? (
              <span
                key={`search-${segment}-${index}`}
                ref={(el) => {
                  if (isCurrent) searchRefs.current[currentMatchIndex] = el;
                }}
                className={isCurrent ? "highlight-orange" : "highlight-yellow"}
              >
                {segment}
              </span>
            ) : (
              segment
            );
          })
          : part
      );
    }

    return parts;
  };

  if (!rows.length) {
    return null;
  }

  return (
    <Container>
      <SearchContainer>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <NavButton onClick={() => moveToMatch("prev")}><ChevronUp size={18} /> </NavButton>
          <NavButton onClick={() => moveToMatch("next")}><ChevronDown size={18} /></NavButton>
          <MatchCounter>
            {searchMatches.length > 0 ? `${currentMatchIndex + 1} of ${searchMatches.length}` : "0 / 0"}
          </MatchCounter>
        </SearchBar>
      </SearchContainer>

      <Table style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center", }} >
        <thead>
          <tr>
            {rows[0].map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, rowIndex) => (
            <tr key={row.join("")}>
              {row.map((column, colIndex) => (
                <td key={colIndex}>{highlightText(column, rowIndex + 1, colIndex)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default CSVRendererPage;

const Table = styled.table`
  width: 100%;
  text-align: left;
  border-collapse: collapse;
 
  th,
  td {
    padding: 5px 10px;
    border: 1px solid #ddd;
  }
 
  .highlight-green {
    background-color: lightgreen;
    font-weight: bold;
  }
 
  .highlight-yellow {
    background-color: yellow;
    font-weight: bold;
  }
 
  .highlight-orange {
    background-color: orange;
    font-weight: bold;
  }
`;
const SearchContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding-bottom: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-start; /* Aligns to the left */
`;

const MatchCounter = styled.span`
  font-size: 14px;
  font-weight: bold;
`;

const BodyIFrame = styled.iframe`
  height: 100%;
  width: 100%;
  border: none;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 4px 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 90%; /* Takes most of the available space */
  margin: 0 auto; /* Centers the search bar */
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  margin-right: 8px;
  padding: 2px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  padding: 4px;
 
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  padding: 0 10px;
`;

//NE-3410 (Anand Mukund) END
