"use client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Export CV as text-based PDF with proper formatting
export const exportToPdfAsText = async (
  cvContent: string,
  coverLetter?: string,
  fileName: string = "AI-Refactored-CV.pdf"
) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 6;
  const maxWidth = pageWidth - margin * 2;

  let yPosition = margin;

  // Helper function to add text with proper wrapping
  const addTextWithWrapping = (text: string, fontSize = 11, isBold = false) => {
    pdf.setFontSize(fontSize);
    if (isBold) {
      pdf.setFont("helvetica", "bold");
    } else {
      pdf.setFont("helvetica", "normal");
    }

    const lines = pdf.splitTextToSize(text, maxWidth);

    for (const line of lines) {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    }
    yPosition += 2; // Extra spacing after paragraphs
  };

  // Helper function to add section header
  const addSectionHeader = (header: string) => {
    if (yPosition > pageHeight - margin - 20) {
      pdf.addPage();
      yPosition = margin;
    }
    yPosition += 4;
    addTextWithWrapping(header.toUpperCase(), 12, true);
    yPosition += 2;
  };

  try {
    // Convert HTML to plain text for PDF
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cvContent;

    // Extract text content while preserving structure
    const sections = tempDiv.querySelectorAll("*");
    let plainTextContent = "";

    sections.forEach((element) => {
      const tagName = element.tagName?.toLowerCase();
      const text = element.textContent?.trim();

      if (text && !element.querySelector("*")) {
        // Only leaf nodes
        if (["h1", "h2", "h3"].includes(tagName)) {
          plainTextContent += `\n\n${text.toUpperCase()}\n`;
        } else if (tagName === "li") {
          plainTextContent += `• ${text}\n`;
        } else if (["p", "div"].includes(tagName)) {
          plainTextContent += `${text}\n`;
        }
      }
    });

    // Add content to PDF
    addTextWithWrapping(plainTextContent);

    // Add cover letter if provided
    if (coverLetter) {
      pdf.addPage();
      yPosition = margin;
      addSectionHeader("Cover Letter");

      const tempDiv2 = document.createElement("div");
      tempDiv2.innerHTML = coverLetter;
      const coverLetterText = tempDiv2.textContent || "";
      addTextWithWrapping(coverLetterText);
    }

    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to export text-based PDF:", error);
    throw error;
  }
};

// Original image-based export (keeping for compatibility)
export const exportToPdf = async (
  cvElement: HTMLElement,
  coverLetterElement: HTMLElement | null,
  fileName: string = "AI-Refactored-Documents.pdf"
) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const addPageAsImage = async (element: HTMLElement) => {
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    let pageCount = 1;
    while (heightLeft >= 0) {
      pageCount++;
      position = -(pageCount - 1) * pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
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

// Export CV as plain text file
export const exportAsTextFile = (
  content: string,
  fileName: string = "CV.txt"
) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  let fullText = "";

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n\n";
  }

  return fullText;
};
