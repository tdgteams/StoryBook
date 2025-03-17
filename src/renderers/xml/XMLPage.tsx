import React, { FC, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { PDFContext } from "../pdf/state";
import { useTranslation } from "../../hooks/useTranslation";
import { ChevronUp, ChevronDown } from "lucide-react"; // Imported arrow icons
//NE-3410 (Anand Mukund) Start

const XMLPage: FC<{}> = () => {
  const {
    state: { mainState, zoomLevel },
  } = useContext(PDFContext);
  const { t } = useTranslation();
  const currentDocument = mainState?.currentDocument;
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedXML, setHighlightedXML] = useState<string>("");
  const [matchIndices, setMatchIndices] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);


  /** Function to escape XML special characters */
  const escapeXML = (xmlString: string) => {
    return xmlString
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  /** Function to highlight text while preserving XML structure */
  const highlightText = (xmlString: string, search: string) => {
    if (!xmlString) return { highlighted: xmlString, newMatchIndices: [] };

    const escapedXML = escapeXML(xmlString);
    const searchRegex = search ? new RegExp(`(${search})`, "gi") : null;
    let newMatchIndices: number[] = [];

    if (searchRegex) {
      let match;
      while ((match = searchRegex.exec(escapedXML)) !== null) {
        newMatchIndices.push(match.index);
      }
      const highlighted = escapedXML.replace(
        searchRegex,
        '<span class="search-highlight">$1</span>'
      );
      return { highlighted, newMatchIndices };
    }

    return { highlighted: escapedXML, newMatchIndices };
  };

  /** Function to pretty-print XML */
  const formatXML = (xmlString: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const serializer = new XMLSerializer();
      return serializer.serializeToString(xmlDoc);
    } catch (error) {
      console.error("Error formatting XML:", error);
      return "Invalid XML";
    }
  };

  /** Update XML rendering when document or search term changes */
  useEffect(() => {
    try {
      const xmlString =
        typeof currentDocument?.fileData === "string"
          ? formatXML(currentDocument.fileData)
          : "Invalid XML";
      const { highlighted, newMatchIndices } = highlightText(xmlString, searchTerm);
      setHighlightedXML(highlighted);
      setMatchIndices(newMatchIndices);
      setCurrentMatchIndex(newMatchIndices.length > 0 ? 0 : -1);
    } catch (error) {
      console.error("Error processing XML:", error);
      setHighlightedXML("Invalid XML");
    }
  }, [currentDocument, searchTerm]);

  /** Handle search input */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  /** Scroll to specific search match */
  const scrollToMatch = (index: number) => {
    const elements = document.querySelectorAll(".search-highlight");
    elements.forEach((el) => el.classList.remove("active-match"));
    if (elements[index]) {
      elements[index].classList.add("active-match");
      setTimeout(() => {
        elements[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  /** Handle navigation between search results */
  const handleNavigation = (direction: "up" | "down") => {
    if (matchIndices.length === 0) return;
    let newIndex = direction === "down" ? currentMatchIndex + 1 : currentMatchIndex - 1;
    if (newIndex >= matchIndices.length) newIndex = 0;
    if (newIndex < 0) newIndex = matchIndices.length - 1;
    setCurrentMatchIndex(newIndex);
  };

  /** Scroll to highlighted match on navigation */
  useEffect(() => {
    if (currentMatchIndex !== -1) {
      scrollToMatch(currentMatchIndex);
    }
  }, [currentMatchIndex]);

  return (
    <>

      <Container>
        <SearchContainer>
          <SearchBar>
            <SearchInput
              type="search"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Type to search..."
            />
            <MatchCounter>{matchIndices.length > 0 ? `${currentMatchIndex + 1}/${matchIndices.length}` : "0/0"}</MatchCounter>
            <NavButton onClick={() => handleNavigation("up")}><ChevronUp size={18} /></NavButton>
            <NavButton onClick={() => handleNavigation("down")}><ChevronDown size={18} /></NavButton>
          </SearchBar>
        </SearchContainer>
        <Content style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center", }}>
          <pre>
            <span dangerouslySetInnerHTML={{ __html: highlightedXML }} />
          </pre>
        </Content>
      </Container>
    </>
  );
};

export default XMLPage;

/** Styled Components */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 30px;
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
const MatchCounter = styled.span`
  font-size: 14px;
  font-weight: bold;
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

const Content = styled.pre`
  width: 100%;
  padding: 16px;
  background-color: #f9f9f9;
  font-family: monospace;
  white-space: pre-wrap;
  overflow-x: auto;
 
  .search-highlight {
    background-color: yellow;
    font-weight: bold;
  }
  .active-match {
    background-color: orange !important;
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
//NE-3410 (Anand Mukund) END