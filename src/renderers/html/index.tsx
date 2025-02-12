import React, { useEffect } from "react";
import styled from "styled-components";
import { DocRenderer, IStyledProps } from "../..";
import { dataURLFileLoader } from "../../utils/fileLoaders";
 
interface HTMLRendererProps {
    mainState: { currentDocument?: { fileData?: string } };
    baseUrl?: string; // Accept baseUrl as a prop
}
 
const HTMLRenderer: DocRenderer = ({ mainState: { currentDocument }}) => {
    useEffect(() => {
      
        const baseUrl=currentDocument?.baseUrl;
        const isClickable=currentDocument?.isClickable;
        const b64String = currentDocument?.fileData as string;
        let encoding = "";
        const bodyBase64 = b64String?.replace(
            /^data:text\/html;(?:charset=([^;]*);)?base64,/,
            (_, charset) => {
                encoding = charset;
                return "";
            }
        ) || "";
 
        let body: string = window.atob(bodyBase64);
 
        if (encoding) {
            // Decode charset
            const buffer = new Uint8Array(body.length);
            for (let i = 0; i < body.length; i++) buffer[i] = body.charCodeAt(i);
            body = new TextDecoder(encoding).decode(buffer);
        }
 
        const iframeCont = document.getElementById("html-body") as HTMLIFrameElement | null;
        const iframe = iframeCont?.contentWindow;
        if (!iframe) return;
        const iframeDoc = iframe.document;
 
        iframeDoc.open();
        iframeDoc.write(body);
        iframeDoc.close();
 
        // Add <base> tag dynamically if baseUrl is provided
        if (baseUrl) {
            let head = iframeDoc.head || iframeDoc.getElementsByTagName("head")[0];
            if (!head) {
                head = iframeDoc.createElement("head");
                iframeDoc.documentElement.insertBefore(head, iframeDoc.body);
            }
 
            let baseElement = iframeDoc.createElement("base");
            baseElement.href = baseUrl;
 
            // Remove any existing <base> tag to prevent duplicates
            const existingBase = head.querySelector("base");
            if (existingBase) {
                head.removeChild(existingBase);
            }
 
            head.insertBefore(baseElement, head.firstChild);
        }
 
        // Intercept all <a> clicks inside iframe
       
        iframeDoc.addEventListener("click", (event) => {
            const target = event.target as HTMLAnchorElement;
            if (target.tagName === "A") {
                if(!isClickable){
                event.preventDefault(); // Prevent the default navigation
                }
                else if(!target.href.startsWith("javascript")){
                // Open the link in a new tab
                event.preventDefault();
                window.open(target.href, "_blank", "noopener,noreferrer");
                }
            }
        });
      
    }, [currentDocument]);
 
    return (
        <Container id="html-renderer">
            {/* Remove sandbox restrictions to allow proper link handling */}
            <BodyIFrame id="html-body" />
        </Container>
    );
};
export default HTMLRenderer;
 
HTMLRenderer.fileTypes = ["htm", "html", "text/htm", "text/html"];
HTMLRenderer.weight = 0;
HTMLRenderer.fileLoader = dataURLFileLoader;


const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  padding: 0 10px; /* Keeps equal padding on both left and right */
`;
 
const BodyIFrame = styled.iframe`
  height: 100%;
  width: 100%;
  padding: 5px;
  margin: 5px; /* Applies equal margin on all sides */
  border: none;
`;