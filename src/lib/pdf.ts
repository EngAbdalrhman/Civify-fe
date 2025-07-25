'use client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPdf = async (
  cvElement: HTMLElement,
  coverLetterElement: HTMLElement | null,
  fileName: string = 'AI-Refactored-Documents.pdf'
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const addPageAsImage = async (element: HTMLElement) => {
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    let pageCount = 1;
    while (heightLeft >= 0) {
      pageCount++;
      position = -(pageCount-1) * pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
  };

  try {
    await addPageAsImage(cvElement);

    if (coverLetterElement) {
      pdf.addPage();
      await addPageAsImage(coverLetterElement);
    }
    
    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to export PDF:", error);
  }
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const pdfjs = await import('pdfjs-dist/build/pdf');
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText;
};
