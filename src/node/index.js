const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;
const Library = require('xport-js').default;
const EmlParser = require('eml-parser');
const puppeteer = require("puppeteer");
const { simpleParser } = require("mailparser");
const MsgReader = require("msgreader").default;



app.use(cors({
    origin: '*', // Allow specific origin
    methods: ['GET', 'POST'],       // Allowed methods
    credentials: false               // If you need to include cookies
}));

const upload = multer({ dest: 'uploads/' });


app.post('/convert', upload.single('file'), (req, res) => {
    const inputPath = path.resolve(req.file.path);
    const outputDir = path.resolve("converted");
    const outputPath = path.resolve(outputDir, `${req.file.filename}.pdf`);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    // Command to convert .docx to .pdf using LibreOffice
    const sofficePath = `"C:/Program Files/LibreOffice/program/soffice.exe"`;
    const command = `${sofficePath} --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
    try {

        exec(command, (error, stdout, stderr) => {

            if (error) {
                console.error('Error converting file:', error);
                fs.unlinkSync(inputPath);
                return res.status(500).send('Error converting file');
            }
            if (!fs.existsSync(outputPath)) {
                console.error("Converted file not found:", outputPath);
                fs.unlinkSync(inputPath); // Cleanup uploaded file
                return res.status(500).send("Converted file not found.");
            }

            res.download(outputPath, (err) => {
                fs.unlinkSync(inputPath); // Remove uploaded file
                fs.unlinkSync(outputPath);
                if (err) {
                    console.error('Error sending file:', err);
                }
            });
        });
    } catch (error) {
        return res.status(500).send('Error converting file');
    }
});

app.post("/convert/xpt-to-csv", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const inputFilePath = path.resolve(req.file.path);
        const outputDir = path.resolve("converted");

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilePath = path.resolve(
            outputDir,
            req.file.originalname.replace(".xpt", "").toUpperCase() + ".csv"
        );

        const lib = new Library(inputFilePath);

        // Read the entire dataset before proceeding
        const records = [];
        for await (let obs of lib.read({ rowFormat: "object" })) {
            records.push(obs);
        }

        console.log(`Total records read: ${records.length}`);


        // Ensure full dataset is written to CSV
        await lib.toCsv(outputDir);

        // Confirm file existence before sending
        if (!fs.existsSync(outputFilePath)) {
            return res.status(500).json({ error: "CSV file not generated" });
        }

        // Send the file as response
        res.download(outputFilePath, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).json({ error: "File sending failed" });
            }

            // Cleanup after sending
            try {
                fs.unlinkSync(inputFilePath);
                fs.unlinkSync(outputFilePath);
                console.log("Files deleted successfully");
            } catch (error) {
                console.error("Error while deleting files:", error);
            }
        });
    } catch (error) {
        console.error("Error converting XPT to CSV:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/convert/eml-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const inputFilePath = path.resolve(req.file.path);
        const outputDir = path.resolve("converted");

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilePath = path.join(
            outputDir,
            path.basename(inputFilePath, ".eml") + ".pdf"
        );
        const emailFile = fs.createReadStream(inputFilePath);
        let extension = req.file.originalname.toLowerCase().includes('.msg') ? 'msg' : 'eml';

        if (extension === 'msg')
            new EmlParser(emailFile).convertMessageToStream('pdf')
                .then((stream) => {
                    const writeStream = fs.createWriteStream(outputFilePath);
                    stream.pipe(writeStream);

                    writeStream.on("finish", () => {
                        // Send the file as response instead of download
                        res.sendFile(outputFilePath, (err) => {
                            if (err) {
                                console.error("Error sending file:", err);
                                res.status(500).json({ error: "File sending failed" });
                            }

                            // Cleanup after sending file
                            try {
                                fs.unlinkSync(inputFilePath);
                                fs.unlinkSync(outputFilePath);
                                console.log("Files deleted successfully");
                            } catch (error) {
                                console.error("Error while deleting files:", error);
                            }
                        });
                    });
                })
                .catch((err) => {
                    console.error("Error converting EML to PDF:", err);
                    res.status(500).json({ error: "File conversion failed" });
                });
        else if (extension === 'eml') {
            new EmlParser(emailFile).convertEmailToStream('pdf')
                .then((stream) => {
                    const writeStream = fs.createWriteStream(outputFilePath);
                    stream.pipe(writeStream);

                    writeStream.on("finish", () => {
                        // Send the file as response instead of download
                        res.sendFile(outputFilePath, (err) => {
                            if (err) {
                                console.error("Error sending file:", err);
                                res.status(500).json({ error: "File sending failed" });
                            }

                            // Cleanup after sending file
                            try {
                                fs.unlinkSync(inputFilePath);
                                fs.unlinkSync(outputFilePath);
                                console.log("Files deleted successfully");
                            } catch (error) {
                                console.error("Error while deleting files:", error);
                            }
                        });
                    });
                })
                .catch((err) => {
                    console.error("Error converting EML to PDF:", err);
                    res.status(500).json({ error: "File conversion failed" });
                });
        }
        else {
            res.status(500).json({ error: "File conversion failed" });
        }
    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/convert/email-to-pdf1", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const inputFilePath = path.join(__dirname, req.file.path);
        const outputDir = path.join(__dirname, "converted");

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilePath = path.join(
            outputDir,
            path.basename(inputFilePath, path.extname(inputFilePath)) + ".pdf"
        );

        const fileBuffer = fs.readFileSync(inputFilePath);
        const fileExtension = req.file.originalname.toLowerCase().endsWith(".msg")
            ? "msg"
            : "eml";

        const convertToPDF = async (htmlContent) => {
            try {
                const browser = await puppeteer.launch({
                    args: ["--no-sandbox", "--disable-setuid-sandbox"],
                });
                const page = await browser.newPage();

                await page.setContent(
                    `<html><body>${htmlContent}</body></html>`,
                    { waitUntil: "networkidle0" }
                );

                await page.pdf({ path: outputFilePath, format: "A4" });
                await browser.close();

                res.sendFile(outputFilePath, (err) => {
                    if (err) {
                        console.error("Error sending file:", err);
                        return res.status(500).json({ error: "File sending failed" });
                    }
                    // Cleanup files
                    fs.unlinkSync(inputFilePath);
                    fs.unlinkSync(outputFilePath);
                });
            } catch (err) {
                console.error("Puppeteer Error:", err);
                res.status(500).json({ error: "PDF conversion failed" });
            }
        };

        if (fileExtension === "msg") {
            const msgReader = new MsgReader(fileBuffer);
            const msgData = msgReader.getFileData();

            const senderEmail = msgData.senderEmail
                ? `<a href="mailto:${msgData.senderEmail}">${msgData.senderEmail}</a>`
                : "Unknown";

            const recipientEmails = msgData.recipients
                ? msgData.recipients.map((r) => `${r.email}</a>`).join(", ")
                : "Unknown";

            const htmlContent = `
          <h1>${msgData.subject}</h1>
          <p><strong>From:</strong> ${senderEmail}</p>
          <p><strong>To:</strong> ${recipientEmails}</p>
          <div>${msgData.body || "No body content"}</div>
        `;
            await convertToPDF(htmlContent);
        } else {
            simpleParser(fileBuffer)
                .then((parsed) => {
                    const senderEmail = parsed.from?.text
                        ? `<a href="mailto:${parsed.from.text}">${parsed.from.text}</a>`
                        : "Unknown";

                    const recipientEmails = parsed.to?.text
                        ? parsed.to.text
                            .split(",")
                            .map((email) => `<a href="mailto:${email.trim()}">${email.trim()}</a>`)
                            .join(", ")
                        : "Unknown";

                    const htmlContent = `
              <h1>${parsed.subject}</h1>
              <p><strong>From:</strong> ${senderEmail}</p>
              <p><strong>To:</strong> ${recipientEmails}</p>
              <div>${parsed.html || parsed.textAsHtml || parsed.text || "No email content"}</div>
            `;
                    convertToPDF(htmlContent);
                })
                .catch((error) => {
                    console.error("Error parsing .eml:", error);
                    res.status(500).json({ error: "File conversion failed" });
                });
        }
    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
