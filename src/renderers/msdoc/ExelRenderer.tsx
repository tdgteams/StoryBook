import React, { useEffect, useState, useRef, useContext, FC } from "react";
import styled from "styled-components";
import { PDFContext } from "../pdf/state";
import { useTranslation } from "../../hooks/useTranslation";
import { ChevronUp, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
//NE-3410 (Anand Mukund) Start

const ExcelRenderer: FC = () => {
    const [content, setContent] = useState<string[][]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchMatches, setSearchMatches] = useState<[number, number][]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
    const matchRefs = useRef<(HTMLTableCellElement | null)[][]>([]);


    const {
        state: { mainState, zoomLevel },
    } = useContext(PDFContext);
    const { t } = useTranslation();
    const currentDocument = mainState?.currentDocument;

    useEffect(() => {
        if (!currentDocument?.fileData) return;

        const fileType = currentDocument.fileType?.toLowerCase();

        const workbook = XLSX.read(currentDocument.fileData as ArrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

        setContent(rows.map((row) => row.map((cell) => String(cell))) as string[][]);
        setSearchMatches([]);
        setCurrentMatchIndex(-1);

    }, [currentDocument]);

    const handleSearch = (term: string) => {

        setSearchTerm(term);

        if (!term) {
            setSearchMatches([]);
            setCurrentMatchIndex(-1);
            return;
        }

        const matches: [number, number][] = [];
        content.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                if (cell.toLowerCase().split(/\b/).includes(term)) {
                    matches.push([rowIndex, cellIndex]);
                }
            });
        });

        setSearchMatches(matches);
        setCurrentMatchIndex(matches.length > 0 ? 0 : -1);
    };

    const nextMatch = () => {
        if (searchMatches.length > 0) {
            setCurrentMatchIndex((prev) => (prev + 1) % searchMatches.length);
        }
    };

    const prevMatch = () => {
        if (searchMatches.length > 0) {
            setCurrentMatchIndex((prev) => (prev - 1 + searchMatches.length) % searchMatches.length);
        }
    };

    useEffect(() => {
        if (currentMatchIndex !== -1 && searchMatches.length > 0) {
            const [row, col] = searchMatches[currentMatchIndex];
            const cellRef = matchRefs.current[row]?.[col];
            if (cellRef) {
                cellRef.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [currentMatchIndex]);

    const highlightText = (text: string, rowIndex: number, cellIndex: number) => {
        if (!searchTerm) return text;

        const lowerText = text.toLowerCase();
        const lowerSearchTerm = searchTerm.toLowerCase();
        const isMatch = lowerText.includes(lowerSearchTerm);
        const isCurrent =
            searchMatches[currentMatchIndex]?.[0] === rowIndex &&
            searchMatches[currentMatchIndex]?.[1] === cellIndex;

        if (!isMatch) return text;

        // Split text into parts where the search term appears
        const regex = new RegExp(`(${searchTerm})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, index) =>
            part.toLowerCase() === lowerSearchTerm ? (
                <HighlightSpan key={index} isCurrent={isCurrent}>
                    {part}
                </HighlightSpan>
            ) : (
                part
            )
        );
    };

    return (
        <>
            <Container>
                <SearchContainer>
                    <SearchBar>
                        <SearchInput type="text" placeholder="Search..." value={searchTerm} onChange={(e) => { handleSearch(e.target.value) }} />
                        <NavButton onClick={prevMatch} disabled={searchMatches.length === 0}>
                            <ChevronUp size={18} />
                        </NavButton>
                        <NavButton onClick={nextMatch} disabled={searchMatches.length === 0}>
                            <ChevronDown size={18} />
                        </NavButton>
                        <MatchCounter>
                            {searchMatches.length > 0 ? `${currentMatchIndex + 1}/${searchMatches.length}` : "0/0"}
                        </MatchCounter>
                    </SearchBar>
                </SearchContainer>

                <Table style={{ transform: `scale(${zoomLevel})` }} >
                    <thead>
                        <tr>
                            {content[0]?.map((col, index) => (
                                <th key={index}>{highlightText(col, 0, index)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {content.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        ref={(el) => {
                                            if (!matchRefs.current[rowIndex + 1]) matchRefs.current[rowIndex + 1] = [];
                                            matchRefs.current[rowIndex + 1][cellIndex] = el;
                                        }}
                                    >
                                        {highlightText(cell, rowIndex + 1, cellIndex)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </>
    );
};

export default ExcelRenderer;

/* Styled Components */
const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    padding: 0 10px;
`;

const SearchContainer = styled.div`
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    padding-bottom: 10px;
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-start;
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

const MatchCounter = styled.span`
    font-size: 14px;
    font-weight: bold;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    th, td {
        padding: 8px;
        border: 1px solid #ccc;
    }
`;

const HighlightSpan = styled.span<{ isCurrent: boolean }>`
    background-color: ${(props) => (props.isCurrent ? "#FFA500" : "#FFFF00")};
    font-weight: bold;
`;
//NE-3410 (Anand Mukund) END
