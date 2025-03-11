import React, { FC, useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { PDFContext } from "../pdf/state";
import { useTranslation } from "../../hooks/useTranslation";
import { ChevronUp, ChevronDown } from "lucide-react"; // Imported arrow icons
//NE-3410 (Anand Mukund) Start

const TXTRendererCon: FC<{}> = () => {
  const {
    state: { mainState, zoomLevel },
  } = useContext(PDFContext);
  const { t } = useTranslation();
  const currentDocument = mainState?.currentDocument;

  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedContent, setHighlightedContent] = useState("");
  const [matchIndices, setMatchIndices] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  const highlightText = (text: string, search: string) => {
    if (!text || !search) return { highlighted: text, newMatchIndices: [] };

    const searchRegex = new RegExp(`(${search})`, "gi");
    let newMatchIndices: number[] = [];
    let match;
    let highlighted = text;
    let lastIndex = 0;
    let highlightedParts = [];

    while ((match = searchRegex.exec(text)) !== null) {
      newMatchIndices.push(match.index);
      highlightedParts.push(text.substring(lastIndex, match.index));
      highlightedParts.push(`<span class="search-highlight">${match[0]}</span>`);
      lastIndex = match.index + match[0].length;
    }
    highlightedParts.push(text.substring(lastIndex));

    highlighted = highlightedParts.join("");

    return { highlighted, newMatchIndices };
  };

  useEffect(() => {
    if (currentDocument?.fileData && typeof currentDocument.fileData === "string") {
      const { highlighted, newMatchIndices } = highlightText(currentDocument.fileData, searchTerm);
      setHighlightedContent(highlighted);
      setMatchIndices(newMatchIndices);
      setCurrentMatchIndex(newMatchIndices.length > 0 ? 0 : -1);
    }
  }, [currentDocument, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (currentDocument?.fileData && typeof currentDocument.fileData === "string") {
      const { highlighted, newMatchIndices } = highlightText(currentDocument.fileData, term);
      setHighlightedContent(highlighted);
      setMatchIndices(newMatchIndices);
      setCurrentMatchIndex(newMatchIndices.length > 0 ? 0 : -1);
    }
  };

  const scrollToMatch = (index: number) => {
    const elements = document.querySelectorAll(".search-highlight");
    elements.forEach((el) => el.classList.remove("active-match"));

    if (elements[index]) {
      elements[index].classList.add("active-match");
      setTimeout(() => {
        elements[index].scrollIntoView({ behavior: "instant", block: "nearest" });
      }, 100);
    }
  };

  const handleNavigation = (direction: "up" | "down") => {
    if (matchIndices.length === 0) return;

    let newIndex = direction === "down" ? currentMatchIndex + 1 : currentMatchIndex - 1;
    if (newIndex >= matchIndices.length) newIndex = 0;
    if (newIndex < 0) newIndex = matchIndices.length - 1;

    setCurrentMatchIndex(newIndex);
  };

  useEffect(() => {
    if (currentMatchIndex !== -1) {
      scrollToMatch(currentMatchIndex);
    }
  }, [currentMatchIndex]);

  return (
    <>

      <Container id="txt-renderer">
        <SearchContainer>
          <SearchBar>
            <SearchInput
              type="search"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Type to search..."
            />
            <MatchCounter>
              {matchIndices.length > 0 ? `${currentMatchIndex + 1}/${matchIndices.length}` : "0/0"}
            </MatchCounter>
            <NavButton onClick={() => handleNavigation("up")}> <ChevronUp size={18} /></NavButton>
            <NavButton onClick={() => handleNavigation("down")}><ChevronDown size={18} /></NavButton>
          </SearchBar>
        </SearchContainer>
        <Content
          style={{ transform: `scale(${zoomLevel})` }}
          dangerouslySetInnerHTML={{
            __html: highlightedContent || (currentDocument?.fileData as string),
          }}
        />
      </Container>
    </>
  );
};

export default TXTRendererCon;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 30px;
`;

const Content = styled.div`
  width: 100%;
  padding: 16px;
  background-color: #f9f9f9;
  font-family: monospace;
  white-space: pre-wrap;
 
  .search-highlight {
    background-color: yellow;
   
  }
  
  .highlight-green {
    background-color: lightgreen;
  }
 
  .active-match {
    background-color: orange !important;
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
const SearchButton = styled.button`
  padding: 5px 10px;
  border: none;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
 
  &:hover {
    background: #0056b3;
  }
`;
//NE-3410 (Anand Mukund) END