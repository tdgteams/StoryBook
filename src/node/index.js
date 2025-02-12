const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors=require('cors');
const app = express();
const PORT = 3000;
 

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
    exec(command, (error, stdout, stderr) => {
         
        if (error) {
            console.error('Error converting file:', error);
             fs.unlinkSync(inputPath);
            return res.status(500).send('Error converting file');
        }
        if (!fs.existsSync(outputPath)) {
            console.error("Converted file not found:", outputPath);
           fs.unlinkSync(outputPath); // Cleanup uploaded file
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
});

app.listen(PORT, () => {
console.log(`Server is running on http://localhost:${PORT}`);
});
