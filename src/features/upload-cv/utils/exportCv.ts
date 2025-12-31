import { saveAs } from 'file-saver';
import type { ResumeData } from '../types';

/**
 * Reliable download helper with fallback for environments where saveAs doesn't work
 */
function downloadBlob(blob: Blob, filename: string): void {
  try {
    // Try native approach first (more reliable in modern browsers)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Delay revocation to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    // Fallback to file-saver
    console.warn('Native download failed, using file-saver fallback:', error);
    saveAs(blob, filename);
  }
}

/**
 * Export the CV to PDF by generating directly from resume data
 * This provides consistent styling without html2canvas issues
 */
export async function exportToPdf(element: HTMLElement, filename: string = 'cv', resumeData?: ResumeData): Promise<void> {
  const { jsPDF } = await import('jspdf');
  
  // If no resumeData provided, try to use the window object (will be set by caller)
  const data = resumeData || (window as any).__cvExportData;
  if (!data) {
    throw new Error('No resume data available for PDF export');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  const addNewPageIfNeeded = (requiredSpace: number = 15) => {
    if (y + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Helper to add text with word wrap
  const addText = (text: string, fontSize: number, options: { bold?: boolean; italic?: boolean; color?: string; align?: 'left' | 'center' | 'right' } = {}) => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(options.color || '#1f2937');
    
    if (options.bold && options.italic) {
      pdf.setFont('helvetica', 'bolditalic');
    } else if (options.bold) {
      pdf.setFont('helvetica', 'bold');
    } else if (options.italic) {
      pdf.setFont('helvetica', 'italic');
    } else {
      pdf.setFont('helvetica', 'normal');
    }

    const lines = pdf.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.4;
    
    lines.forEach((line: string) => {
      addNewPageIfNeeded(lineHeight);
      if (options.align === 'center') {
        pdf.text(line, pageWidth / 2, y, { align: 'center' });
      } else if (options.align === 'right') {
        pdf.text(line, pageWidth - margin, y, { align: 'right' });
      } else {
        pdf.text(line, margin, y);
      }
      y += lineHeight;
    });
  };

  const addLine = () => {
    addNewPageIfNeeded(5);
    pdf.setDrawColor('#374151');
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  const { personalInfo, sections } = data;

  // Header - Name
  addText(personalInfo.fullName || 'Resume', 24, { bold: true, align: 'center' });
  y += 2;

  // Contact info
  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.city || personalInfo.country) {
    contactParts.push([personalInfo.city, personalInfo.country].filter(Boolean).join(', '));
  }
  if (contactParts.length > 0) {
    addText(contactParts.join(' | '), 10, { align: 'center', color: '#6b7280' });
  }

  // Links
  const linkParts: string[] = [];
  if (personalInfo.linkedin) linkParts.push(personalInfo.linkedin);
  if (personalInfo.github) linkParts.push(personalInfo.github);
  if (personalInfo.website) linkParts.push(personalInfo.website);
  if (linkParts.length > 0) {
    addText(linkParts.join(' | '), 9, { align: 'center', color: '#6b7280' });
  }

  y += 5;

  // Summary
  if (personalInfo.summary) {
    addLine();
    addText('PROFESSIONAL SUMMARY', 12, { bold: true });
    y += 2;
    addText(personalInfo.summary, 10);
    y += 5;
  }

  // Sections
  for (const section of sections || []) {
    if (section.isVisible === false) continue;
    
    addNewPageIfNeeded(20);
    addLine();
    addText(section.title?.toUpperCase() || '', 12, { bold: true });
    y += 3;

    if (section.type === 'skills') {
      const skills = section.items?.map((item: { title?: string }) => item.title).filter(Boolean).join(', ');
      if (skills) {
        addText(skills, 10);
      }
    } else if (section.type === 'languages') {
      for (const item of section.items || []) {
        addNewPageIfNeeded(8);
        addText(`${item.title}${item.subtitle ? ` - ${item.subtitle}` : ''}`, 10);
      }
    } else {
      for (const item of section.items || []) {
        addNewPageIfNeeded(15);
        
        // Title line
        let titleLine = item.title || '';
        if (item.subtitle) titleLine += ` | ${item.subtitle}`;
        addText(titleLine, 11, { bold: true });

        // Date/Location line
        if (item.date || item.location) {
          addText([item.date, item.location].filter(Boolean).join(' | '), 9, { italic: true, color: '#6b7280' });
        }

        // Description
        if (item.description) {
          y += 1;
          const lines = item.description.split('\n').filter((l: string) => l.trim());
          for (const line of lines) {
            addNewPageIfNeeded(6);
            const bulletLine = line.startsWith('•') || line.startsWith('-') ? line : `• ${line}`;
            addText(bulletLine, 9);
          }
        }
        y += 3;
      }
    }
    y += 3;
  }

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
  downloadBlob(blob, `${filename}.docx`);
}
