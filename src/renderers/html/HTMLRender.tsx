import React, { useEffect, useState, useCallback, FC, useContext } from "react";
import styled from "styled-components";
import { PDFContext } from "../pdf/state";
import { useTranslation } from "../../hooks/useTranslation";
import { ChevronUp, ChevronDown } from "lucide-react"; // Imported arrow icons

//NE-3410 (Anand Mukund) Start
const HTMLRendererPage: FC<{}> = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [matches, setMatches] = useState<Element[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  // Hold the original HTML body so we can reset before applying new highlights


  const [originalHTML, setOriginalHTML] = useState<string>("");
  const {
    state: { mainState, zoomLevel },
  } = useContext(PDFContext);
  const { t } = useTranslation();
  const currentDocument = mainState?.currentDocument;

  // Write the HTML into the iframe and store a pristine copy for future resets.
  const writeIframeContent = useCallback(() => {
    if (!currentDocument?.fileData) return;
    const baseUrl = currentDocument?.baseUrl;
    const isClickable = currentDocument?.isClickable;
    const b64String = currentDocument.fileData;
    let encoding = "";
    const bodyBase64 =
      b64String.replace(
        /^data:text\/html;(?:charset=([^;]*);)?base64,/,
        (_, charset) => {
          encoding = charset;
          return "";
        }
      ) || "";
    let body: string = window.atob(bodyBase64);
    if (encoding) {
      const buffer = new Uint8Array(body.length);
      for (let i = 0; i < body.length; i++) {
        buffer[i] = body.charCodeAt(i);
      }
      body = new TextDecoder(encoding).decode(buffer);
    }

    const iframeCont = document.getElementById("html-body") as HTMLIFrameElement | null;
    if (!iframeCont) return;
    const iframe = iframeCont.contentWindow;
    if (!iframe) return;
    const iframeDoc = iframe.document;
    iframeDoc.open();
    iframeDoc.write(body);
    iframeDoc.close();

    // Save the original body HTML so we can reset before highlighting
    setOriginalHTML(iframeDoc.body.innerHTML);

    // Inject style for highlighting
    const styleEl = iframeDoc.createElement("style");
    styleEl.innerHTML = `
      .search-highlight { background-color: yellow; }
      .active-match { background-color: orange !important; }
      .green-highlight { background-color: lightgreen; }
    `;
    // Remove any existing style we added
    const oldStyle = iframeDoc.head.querySelector("#highlight-style");
    if (oldStyle) {
      oldStyle.remove();
    }
    styleEl.id = "highlight-style";
    iframeDoc.head.appendChild(styleEl);

    // Setup link behavior if needed
    iframeDoc.addEventListener("click", (event) => {
      const target = event.target as HTMLAnchorElement;
      if (target.tagName === "A") {
        if (!isClickable) {
          event.preventDefault();
        } else if (!target.href.startsWith("javascript")) {
          event.preventDefault();
          window.open(target.href, "_blank", "noopener,noreferrer");
        }
      }
    });

    // If a base URL is provided, insert a <base> element.
    if (baseUrl) {
      let head = iframeDoc.head || iframeDoc.getElementsByTagName("head")[0];
      if (!head) {
        head = iframeDoc.createElement("head");
        iframeDoc.documentElement.insertBefore(head, iframeDoc.body);
      }
      let baseElement = iframeDoc.createElement("base");
      baseElement.href = baseUrl;
      const existingBase = head.querySelector("base");
      if (existingBase) head.removeChild(existingBase);
      head.insertBefore(baseElement, head.firstChild);
    }
  }, [currentDocument]);

  // After content loads, highlight the default words if provided.
  const highlightDefaultWords = useCallback(() => {
    if (!currentDocument?.highlightedWords || currentDocument.highlightedWords.length === 0) return;
    const iframeCont = document.getElementById("html-body") as HTMLIFrameElement | null;
    if (!iframeCont) return;
    const iframeDoc = iframeCont.contentWindow?.document;
    if (!iframeDoc) return;
    currentDocument.highlightedWords.forEach((word) => {
      // Use a recursive walker to highlight each word
      highlightTextNodes(iframeDoc.body, word, [], "green");
    });
  }, [currentDocument]);

  // A helper function to recursively traverse text nodes and wrap matches.
  // The optional highlightType parameter allows us to set different classes:
  // - if highlightType === "green" then use green-highlight class.
  // - otherwise, use search-highlight.
  const highlightTextNodes = useCallback(
    (
      node: Node,
      term: string,
      matchArray: Element[],
      highlightType: "search" | "green" = "search"
    ) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.nodeValue) return;
        const regex = new RegExp(`(${term})`, "gi");
        if (regex.test(node.nodeValue)) {
          const frag = node.ownerDocument!.createDocumentFragment();
          const parts = node.nodeValue.split(regex);
          parts.forEach((part) => {
            if (regex.test(part)) {
              const markEl = node.ownerDocument!.createElement("span");
              markEl.className = highlightType === "green" ? "green-highlight" : "search-highlight";
              markEl.textContent = part;
              frag.appendChild(markEl);
              matchArray.push(markEl);
            } else {
              frag.appendChild(node.ownerDocument!.createTextNode(part));
            }
          });
          node.parentNode?.replaceChild(frag, node);
        }
      } else {
        node.childNodes.forEach((child) =>
          highlightTextNodes(child, term, matchArray, highlightType)
        );
      }
    },
    []
  );

  // Initial load or when currentDocument changes.
  useEffect(() => {
    writeIframeContent();
    // Clear search when document changes
    setSearchTerm("");
    setMatches([]);
    setCurrentMatchIndex(-1);
    // Delay default word highlighting slightly to ensure the document is fully loaded.
    setTimeout(() => {
      highlightDefaultWords();
    }, 100);
  }, [currentDocument, writeIframeContent, highlightDefaultWords]);

  // A helper function to reset the iframe body to original HTML.
  const resetIframeBody = useCallback(() => {
    const iframeCont = document.getElementById("html-body") as HTMLIFrameElement | null;
    if (!iframeCont) return;
    const iframeDoc = iframeCont.contentWindow?.document;
    if (!iframeDoc) return;
    iframeDoc.body.innerHTML = originalHTML;
    // Re-apply default green highlights if available.
    if (currentDocument?.highlightedWords && currentDocument.highlightedWords.length > 0) {
      currentDocument.highlightedWords.forEach((word) => {
        highlightTextNodes(iframeDoc.body, word, [], "green");
      });
    }
  }, [originalHTML, currentDocument, highlightTextNodes]);

  // When searchTerm changes, reset the iframe content and reapply search highlighting.
  useEffect(() => {
    // Delay to ensure iframe is ready.
    const timeout = setTimeout(() => {
      if (!searchTerm) {
        // If empty, reset to original content and clear matches.
        resetIframeBody();
        setMatches([]);
        setCurrentMatchIndex(-1);
        return;
      }
      resetIframeBody();
      const iframeCont = document.getElementById("html-body") as HTMLIFrameElement | null;
      if (!iframeCont) return;
      const iframeDoc = iframeCont.contentWindow?.document;
      if (!iframeDoc) return;
      const foundMatches: Element[] = [];
      highlightTextNodes(iframeDoc.body, searchTerm, foundMatches, "search");
      setMatches(foundMatches);
      // Set first match as active if exists.
      if (foundMatches.length) {
        setCurrentMatchIndex(0);
        // Scroll to first match after a short delay.
        setTimeout(() => {
          foundMatches[0].classList.add("active-match");
          foundMatches[0].scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      } else {
        setCurrentMatchIndex(-1);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [searchTerm, highlightTextNodes, resetIframeBody]);

  // Function to scroll to a given match and mark it as active.
  const scrollToMatch = (index: number) => {
    if (!matches || matches.length === 0) return;
    // Remove active class from all matches.
    matches.forEach((el) => el.classList.remove("active-match"));
    if (matches[index]) {
      matches[index].classList.add("active-match");
      matches[index].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Navigation handler for Up and Down buttons.
  const handleNavigation = (direction: "up" | "down") => {
    if (!matches || matches.length === 0) return;
    let newIndex = currentMatchIndex;
    if (direction === "down") {
      newIndex = currentMatchIndex + 1;
      if (newIndex >= matches.length) newIndex = 0;
    } else {
      newIndex = currentMatchIndex - 1;
      if (newIndex < 0) newIndex = matches.length - 1;
    }
    setCurrentMatchIndex(newIndex);
    scrollToMatch(newIndex);
  };

  return (
    <>

      <Container>
        <SearchContainer>
          <SearchBar>
            <SearchInput
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <NavButton onClick={() => handleNavigation("up")}><ChevronUp size={18} /></NavButton>
            <NavButton onClick={() => handleNavigation("down")}><ChevronDown size={18} /></NavButton>
            <MatchCounter>
              {matches.length ? `${currentMatchIndex + 1} / ${matches.length}` : "0 / 0"}
            </MatchCounter>
          </SearchBar>
        </SearchContainer>
        <BodyIFrame id="html-body" title="HTML Document" style={{ transform: `scale(${zoomLevel})` }} />
      </Container>

    </>


  );
};

export default HTMLRendererPage;

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
