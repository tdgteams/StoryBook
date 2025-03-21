import React, { useState, FC, useContext } from "react";
import styled from "styled-components";
import { Button } from "../../../components/common";
import { IStyledProps } from "../../..";
import { PDFContext } from "../state";
import { setCurrentPage } from "../state/actions";
import { NextPDFNavIcon, PrevPDFNavIcon } from "./icons";
import { useTranslation } from "../../../hooks/useTranslation";
/** RL: Added code to support Jumping to a particular page number**/
const PDFPagination: FC = () => {
  const {
    state: { currentPage, numPages },
    dispatch,
  } = useContext(PDFContext);
  const { t } = useTranslation();

  // Local state for the input field
  const [inputPage, setInputPage] = useState(currentPage.toString());

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const newPage = parseInt(inputPage, 10);
      if (!isNaN(newPage) && newPage >= 1 && newPage <= numPages) {
        dispatch(setCurrentPage(newPage));
      }
      // Update input field to match the currentPage state
      setInputPage(newPage.toString());
    }
  };

  // Sync input with the currentPage when it changes externally
  React.useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  return (
    <Container id="pdf-pagination">
      <PageNavButtonLeft
        id="pdf-pagination-prev"
        onClick={() => dispatch(setCurrentPage(currentPage - 1))}
        disabled={currentPage === 1}
      >
        <PrevPDFNavIcon color="#000" size="50%" />
      </PageNavButtonLeft>

      <PageTag id="pdf-pagination-info">
        <Input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        of {numPages}
      </PageTag>

      <PageNavButtonRight
        id="pdf-pagination-next"
        onClick={() => dispatch(setCurrentPage(currentPage + 1))}
        disabled={currentPage >= numPages}
      >
        <NextPDFNavIcon color="#000" size="50%" />
      </PageNavButtonRight>
    </Container>
  );
};

export default PDFPagination;

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const PageNavButtonLeft = styled(Button)`
  width: 30px;
  height: 30px;
  margin: 0 5px;
`;

const PageNavButtonRight = styled(PageNavButtonLeft)`
  margin: 0 20px 0 5px;
`;

const PageTag = styled.div`
  color: ${(props: IStyledProps) => props.theme.textPrimary};
  font-size: 14px;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 40px;
  text-align: center;
  font-size: 14px;
  margin: 0 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px;
`;

