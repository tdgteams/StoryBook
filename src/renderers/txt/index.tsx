import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DocRenderer } from "../..";
import { textFileLoader } from "../../utils/fileLoaders";
import { Container as SearchContainer } from "../pdf/components/PDFControls";
 
const TXTRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedContent, setHighlightedContent] = useState("");
  const highlightWords = currentDocument?.highlightedWords==undefined?[]:currentDocument.highlightedWords; // Predefined words to highlight
 
  // Highlight matching terms in the text
  const highlightText = (text: any, terms: string[], search: string) => {
    if (!text) return text;
 
    // Regex for predefined terms
    const predefinedRegex = new RegExp(`(${terms.join("|")})`, "gi");
    // Regex for search term
    const searchRegex = search ? new RegExp(`(${search})`, "gi") : null;
 
    // Highlight predefined terms
    let highlighted = text.replace(
      predefinedRegex,
      `<span class="highlight">$1</span>`
    );
 
    // Highlight the search term (if exists) on top of predefined terms
    if (searchRegex) {
      highlighted = highlighted.replace(
        searchRegex,
        `<span class="search-highlight">$1</span>`
      );
    }
 
    return highlighted;
  };
 
  useEffect(() => {
    if (currentDocument?.fileData) {
      // Highlight predefined words on initial render
      const initialHighlighted = highlightText(
        currentDocument.fileData,
        highlightWords,
        searchTerm
      );
      setHighlightedContent(initialHighlighted);
    }
  }, [currentDocument, searchTerm, highlightWords]);
 
  // Handle search term input
  const handleSearch = (term: string) => {
    setSearchTerm(term);
 
    if (currentDocument?.fileData) {
      const highlighted = highlightText(
        currentDocument.fileData,
        highlightWords,
        term
      );
      setHighlightedContent(highlighted);
    }
  };
 
  return (
    <Container id="txt-renderer">
      {/* Search Bar */}
      <SearchContainer>
        <label htmlFor="search">Search:</label>
        <input type="search" id="search" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
      </SearchContainer>
 
      {/* Render highlighted content */}
      <Content
        dangerouslySetInnerHTML={{
          __html: highlightedContent || (currentDocument?.fileData as string),
        }}
      />
    </Container>
  );
};
 
export default TXTRenderer;
 
TXTRenderer.fileTypes = ["txt", "text/plain"];
TXTRenderer.weight = 0;
TXTRenderer.fileLoader = textFileLoader;
 
// Styled components
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
 
  .highlight {
    background-color: yellow;
    font-weight: bold;
  }
 
  .search-highlight {
    background-color: lightgreen;
    font-weight: bold;
  }
`;