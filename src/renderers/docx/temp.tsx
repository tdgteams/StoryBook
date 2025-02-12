// import React, { useState } from 'react';
 
// const DocxToPdf = () => {
//   const [file, setFile] = useState(null);
 
//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };
 
//   const handleConvert = async () => {
//     if (!file) {
//       alert('Please upload a .docx file');
//       return;
//     }
 
//     const formData = new FormData();
//     formData.append('file', file);
 
//     try {
// const response = await fetch('http://localhost:3000/convert', {
//         method: 'POST',
//         body: formData,
//       });
 
//       if (response.ok) {
//         const blob = await response.blob();
 
//         // Convert the Blob into a File instance
// const convertedFile = new File([blob], `${file.name.split('.').slice(0, -1).join('.')}.pdf`, {
//           type: 'application/pdf',
//         });
 
//         console.log('Converted File Instance:', convertedFile);
 
//         // Optional: Download the file
//         const url = URL.createObjectURL(convertedFile);
//         const link = document.createElement('a');
//         link.href = url;
// link.download = convertedFile.name;
// link.click();
//         URL.revokeObjectURL(url);
 
//         // You can now use `convertedFile` for further operations
//       } else {
//         alert('Failed to convert the file');
//       }
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       alert('Error uploading file');
//     }
//   };
 
//   return (
//     <div>
//       <h2>Convert .docx to .pdf</h2>
//       <input type="file" accept=".docx" onChange={handleFileChange} />
//       <button onClick={handleConvert}>Convert</button>
//     </div>
//   );
// };
 
// export default DocxToPdf;