import { saveAs } from 'file-saver';
import type { ResumeData } from '../types';

/**
 * Export the CV preview to PDF using html2canvas and jspdf
 * @param element - The HTML element to capture (CV preview container)
 * @param filename - The output filename (without extension)
 */
export async function exportToPdf(element: HTMLElement, filename: string = 'cv'): Promise<void> {
  // Dynamically import to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  // Capture the element as canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  // Create PDF with A4 dimensions
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add additional pages if needed
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  // Save the PDF
  pdf.save(`${filename}.pdf`);
}

/**
 * Export the CV data to DOCX format
 * @param resumeData - The resume data to export
 * @param filename - The output filename (without extension)
 */
export async function exportToDocx(resumeData: ResumeData, filename: string = 'cv'): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('docx');

  const { personalInfo, sections } = resumeData;

  // Build document content
  const children: any[] = [];

  // Header with name
  children.push(
    new Paragraph({
      text: personalInfo.fullName,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Contact info line
  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.city || personalInfo.country) {
    contactParts.push([personalInfo.city, personalInfo.country].filter(Boolean).join(', '));
  }

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        text: contactParts.join(' | '),
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // Links line
  const linkParts: string[] = [];
  if (personalInfo.linkedin) linkParts.push(`LinkedIn: ${personalInfo.linkedin}`);
  if (personalInfo.github) linkParts.push(`GitHub: ${personalInfo.github}`);
  if (personalInfo.website) linkParts.push(`Website: ${personalInfo.website}`);

  if (linkParts.length > 0) {
    children.push(
      new Paragraph({
        text: linkParts.join(' | '),
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // Summary
  if (personalInfo.summary) {
    children.push(
      new Paragraph({
        text: 'PROFESSIONAL SUMMARY',
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
        spacing: { before: 300, after: 200 },
      })
    );
    children.push(
      new Paragraph({
        text: personalInfo.summary,
        spacing: { after: 300 },
      })
    );
  }

  // Sections
  for (const section of sections) {
    if (!section.isVisible && section.isVisible !== undefined) continue;

    children.push(
      new Paragraph({
        text: section.title.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
        spacing: { before: 300, after: 200 },
      })
    );

    // Skills section - render as comma-separated list
    if (section.type === 'skills') {
      const skills = section.items.map(item => item.title).filter(Boolean);
      if (skills.length > 0) {
        children.push(
          new Paragraph({
            text: skills.join(', '),
            spacing: { after: 200 },
          })
        );
      }
    }
    // Languages section
    else if (section.type === 'languages') {
      for (const item of section.items) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title, bold: true }),
              new TextRun({ text: item.subtitle ? ` - ${item.subtitle}` : '' }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }
    // Other sections (experience, education, projects, etc.)
    else {
      for (const item of section.items) {
        // Title and subtitle
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title, bold: true }),
              new TextRun({ text: item.subtitle ? ` | ${item.subtitle}` : '' }),
            ],
            spacing: { after: 50 },
          })
        );

        // Date and location
        if (item.date || item.location) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ 
                  text: [item.date, item.location].filter(Boolean).join(' | '),
                  italics: true,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }

        // Description
        if (item.description) {
          // Split description by newlines for bullet points
          const descLines = item.description.split('\n').filter(line => line.trim());
          for (const line of descLines) {
            children.push(
              new Paragraph({
                text: line.startsWith('•') || line.startsWith('-') ? line : `• ${line}`,
                spacing: { after: 50 },
                indent: { left: 360 },
              })
            );
          }
        }

        // Add spacing after each item
        children.push(new Paragraph({ spacing: { after: 200 } }));
      }
    }
  }

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}
