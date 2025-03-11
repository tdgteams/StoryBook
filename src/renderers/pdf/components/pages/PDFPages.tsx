import React, { FC, useContext, useEffect, useCallback, useState } from "react";
import { Document } from "react-pdf";
import styled from "styled-components";
import { useTranslation } from "../../../../hooks/useTranslation";
import { PDFContext } from "../../state";
import { setNumPages } from "../../state/actions";
import { initialPDFState } from "../../state/reducer";
import { PDFAllPages } from "./PDFAllPages";
import PDFSinglePage from "./PDFSinglePage";
import { ChevronUp, ChevronDown } from "lucide-react"; // Arrow icons
//NE-3410 (Anand Mukund) Start
const PDFPages: FC<{}> = () => {
  const [searchText, setSearchText] = useState("");
  const [matches, setMatches] = useState<NodeListOf<Element> | null>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);

  const { state: { mainState, paginated }, dispatch } = useContext(PDFContext);
  const { t } = useTranslation();
  const currentDocument = mainState?.currentDocument || null;
  const highlightedWords = currentDocument?.highlightedWords || [];

  function highlightPattern(text: string, pattern: string) {
    if (!text) return text;
    const allPatterns = [...highlightedWords, pattern].filter(Boolean);
    if (allPatterns.length === 0) return text;
    const searchRegex = new RegExp(`(${allPatterns.join("|")})`, "gi");

    return text.replace(searchRegex, (match) =>
      match.toLowerCase() === pattern.toLowerCase()
        ? `<mark class="search-highlight">${match}</mark>`
        : `<mark class="highlight-green">${match}</mark>`
    );
  }

  const textRenderer = useCallback(
    (textItem: any) => highlightPattern(textItem.str, searchText),
    [searchText, highlightedWords]
  );

  function onChange(event: any) {
    setSearchText(event.target.value);
  }

  const updateMatches = () => {
    setTimeout(() => {
      const highlightedElements = document.querySelectorAll(".search-highlight");
      setMatches(highlightedElements);
      setCurrentMatchIndex(highlightedElements.length > 0 ? 0 : -1);
    }, 100); // Delay to allow DOM to update
  };

  useEffect(() => {
    updateMatches();
  }, [searchText]);

  const scrollToMatch = (index: number) => {
    if (!matches || matches.length === 0) return;
    matches.forEach((el) => el.classList.remove("active-match"));

    if (matches[index]) {
      matches[index].classList.add("active-match");
      matches[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleNavigation = (direction: "up" | "down") => {
    if (!matches || matches.length === 0) return;

    let newIndex = direction === "down" ? currentMatchIndex + 1 : currentMatchIndex - 1;
    if (newIndex >= matches.length) newIndex = 0;
    if (newIndex < 0) newIndex = matches.length - 1;

    setCurrentMatchIndex(newIndex);
    scrollToMatch(newIndex);
  };

  useEffect(() => {
    if (currentMatchIndex !== -1) {
      scrollToMatch(currentMatchIndex);
    }
  }, [currentMatchIndex]);

  // 🔥 Fix for scrolling issue when toggling pagination mode
  useEffect(() => {
    setTimeout(() => {
      updateMatches();
      if (matches && matches.length > 0) {
        setCurrentMatchIndex(0);
        setTimeout(() => {
          scrollToMatch(0); // Ensure scroll happens after DOM updates
        }, 300);
      }
    }, 500);
  }, [paginated]); // Runs when switching between single/all pages mode

  useEffect(() => {
    dispatch(setNumPages(initialPDFState.numPages));
  }, [currentDocument]);

  if (!currentDocument || currentDocument.fileData === undefined) return null;

  return (
    <>
      <SearchContainer>
        <SearchBar>
          <SearchInput
            type="search"
            id="search"
            value={searchText}
            onChange={onChange}
            placeholder="Type to search..."
          />
          <MatchCounter>
            {matches ? `${currentMatchIndex + 1}/${matches.length}` : "0/0"}
          </MatchCounter>
          <NavButton onClick={() => handleNavigation("up")}>
            <ChevronUp size={18} />
          </NavButton>
          <NavButton onClick={() => handleNavigation("down")}>
            <ChevronDown size={18} />
          </NavButton>
        </SearchBar>
      </SearchContainer>

      <DocumentPDF
        file={currentDocument.fileData}
        onLoadSuccess={({ numPages }) => dispatch(setNumPages(numPages))}
        loading={<span>{t("pdfPluginLoading")}</span>}
      >
        {paginated ? <PDFSinglePage textRenderer={textRenderer} /> : <PDFAllPages textRenderer={textRenderer} />}
      </DocumentPDF>
    </>
  );
};

const DocumentPDF = styled(Document)`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  font-size: 26px;
 
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
  top: 46;
  z-index: 1000;
  background: #fff;
  padding-bottom: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-start;
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
  width: 90%;
  margin: 0 auto;
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

export default PDFPages;

//NE-3410 (Anand Mukund) END