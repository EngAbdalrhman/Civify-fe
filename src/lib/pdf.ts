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

  const addPageAsImage = async (element: HTMLElement, pageNumber: number) => {
    if (pageNumber > 1) {
      pdf.addPage();
    }
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
  };

  try {
    // Add CV
    await addPageAsImage(cvElement, 1);

    // Add Cover Letter if it exists
    if (coverLetterElement) {
      await addPageAsImage(coverLetterElement, 2);
    }

    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to export PDF:", error);
  }
};
