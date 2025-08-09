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
  const margin = 15;
  const lineHeight = 5;
  const maxWidth = pageWidth - margin * 2;

  let yPosition = margin;

  // Helper function to add text with proper wrapping and formatting
  const addTextWithWrapping = (
    text: string,
    fontSize = 10,
    isBold = false,
    isItalic = false,
    leftIndent = 0
  ) => {
    pdf.setFontSize(fontSize);

    if (isBold && isItalic) {
      pdf.setFont("helvetica", "bolditalic");
    } else if (isBold) {
      pdf.setFont("helvetica", "bold");
    } else if (isItalic) {
      pdf.setFont("helvetica", "italic");
    } else {
      pdf.setFont("helvetica", "normal");
    }

    const effectiveWidth = maxWidth - leftIndent;
    const lines = pdf.splitTextToSize(text, effectiveWidth);

    for (const line of lines) {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin + leftIndent, yPosition);
      yPosition += lineHeight;
    }
  };

  // Helper function to add section header
  const addSectionHeader = (header: string) => {
    if (yPosition > pageHeight - margin - 15) {
      pdf.addPage();
      yPosition = margin;
    }
    yPosition += 3;
    addTextWithWrapping(header, 12, true);
    // Add a line under the header
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition + 1, pageWidth - margin, yPosition + 1);
    yPosition += 4;
  };

  // Helper function to add spacing
  const addSpacing = (space = 2) => {
    yPosition += space;
  };

  try {
    // Parse HTML content while preserving structure
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cvContent;

    // Process different HTML elements to maintain formatting
    const processElement = (element: Element) => {
      const tagName = element.tagName?.toLowerCase();
      const text = element.textContent?.trim() || "";

      if (!text) return;

      switch (tagName) {
        case "h1":
          addSectionHeader(text.toUpperCase());
          break;
        case "h2":
          addSpacing(3);
          addTextWithWrapping(text, 11, true);
          addSpacing(2);
          break;
        case "h3":
          addSpacing(2);
          addTextWithWrapping(text, 10, true);
          addSpacing(1);
          break;
        case "p":
          if (text.length > 0) {
            addTextWithWrapping(text);
            addSpacing(2);
          }
          break;
        case "li":
          addTextWithWrapping(`• ${text}`, 10, false, false, 5);
          addSpacing(1);
          break;
        case "strong":
        case "b":
          addTextWithWrapping(text, 10, true);
          break;
        case "em":
        case "i":
          addTextWithWrapping(text, 10, false, true);
          break;
        case "span":
          // Check for styling classes to preserve formatting
          if (
            element.classList.contains("font-bold") ||
            element.classList.contains("font-semibold")
          ) {
            addTextWithWrapping(text, 10, true);
          } else {
            addTextWithWrapping(text);
          }
          break;
        default:
          // For other elements, check if they have child elements
          if (element.children.length === 0) {
            addTextWithWrapping(text);
            addSpacing(1);
          }
          break;
      }
    };

    // Process the HTML structure
    const walkElements = (element: Element) => {
      // Process headers first
      if (["h1", "h2", "h3"].includes(element.tagName?.toLowerCase())) {
        processElement(element);
        return;
      }

      // Process lists
      if (
        element.tagName?.toLowerCase() === "ul" ||
        element.tagName?.toLowerCase() === "ol"
      ) {
        const listItems = element.querySelectorAll("li");
        listItems.forEach((li) => processElement(li));
        addSpacing(2);
        return;
      }

      // Process paragraphs and divs
      if (["p", "div"].includes(element.tagName?.toLowerCase())) {
        if (element.children.length === 0) {
          processElement(element);
        } else {
          // Process children recursively
          Array.from(element.children).forEach((child) => walkElements(child));
        }
        return;
      }

      // Process other elements
      if (element.children.length === 0) {
        processElement(element);
      } else {
        Array.from(element.children).forEach((child) => walkElements(child));
      }
    };

    // Start processing from the root
    Array.from(tempDiv.children).forEach((child) => walkElements(child));

    // Add cover letter if provided
    if (coverLetter) {
      pdf.addPage();
      yPosition = margin;
      addSectionHeader("COVER LETTER");

      const tempDiv2 = document.createElement("div");
      tempDiv2.innerHTML = coverLetter;

      // Process cover letter with paragraph formatting
      const paragraphs = coverLetter.split(/\n+/);
      paragraphs.forEach((paragraph) => {
        if (paragraph.trim()) {
          // Remove HTML tags but preserve line breaks
          const cleanText = paragraph.replace(/<[^>]*>/g, "").trim();
          if (cleanText) {
            addTextWithWrapping(cleanText);
            addSpacing(3);
          }
        }
      });
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

// Enhanced plain text export that preserves formatting
export const exportAsTextFile = (
  content: string,
  fileName: string = "CV.txt"
) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  // Process HTML to maintain structure in plain text
  const processToText = (element: Element): string => {
    const tagName = element.tagName?.toLowerCase();
    const text = element.textContent?.trim() || "";

    if (!text) return "";

    switch (tagName) {
      case "h1":
      case "h2":
      case "h3":
        return `\n\n${text.toUpperCase()}\n${"=".repeat(text.length)}\n`;
      case "p":
        return `${text}\n\n`;
      case "li":
        return `• ${text}\n`;
      case "br":
        return "\n";
      case "strong":
      case "b":
        return `**${text}**`;
      case "em":
      case "i":
        return `*${text}*`;
      default:
        if (element.children.length === 0) {
          return text + "\n";
        }
        return "";
    }
  };

  // Walk through elements and build formatted text
  const walkAndFormat = (element: Element): string => {
    let result = "";

    if (element.children.length === 0) {
      result += processToText(element);
    } else {
      // Process headers and lists specially
      if (["h1", "h2", "h3"].includes(element.tagName?.toLowerCase())) {
        result += processToText(element);
      } else if (
        element.tagName?.toLowerCase() === "ul" ||
        element.tagName?.toLowerCase() === "ol"
      ) {
        Array.from(element.children).forEach((child) => {
          result += processToText(child);
        });
        result += "\n";
      } else {
        Array.from(element.children).forEach((child) => {
          result += walkAndFormat(child);
        });
      }
    }

    return result;
  };

  let formattedText = "";
  Array.from(tempDiv.children).forEach((child) => {
    formattedText += walkAndFormat(child);
  });

  // Clean up excessive newlines while preserving structure
  formattedText = formattedText.replace(/\n{3,}/g, "\n\n").trim();

  const blob = new Blob([formattedText], { type: "text/plain" });
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
