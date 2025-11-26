'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { ResumeData } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

// Register fonts - using standard fonts for now to avoid network issues
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf',
// });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#2563eb',
  },
  jobTitle: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    fontSize: 9,
    color: '#6b7280',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#2563eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
    paddingBottom: 2,
  },
  item: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  itemSubtitle: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#374151',
  },
  date: {
    fontSize: 9,
    color: '#6b7280',
  },
  description: {
    fontSize: 10,
    color: '#374151',
    marginTop: 2,
  },
});

const ResumeDocument: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.fullName}</Text>
          <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
          <View style={styles.contactInfo}>
            {personalInfo.email && <Text>{personalInfo.email}</Text>}
            {personalInfo.phone && <Text>• {personalInfo.phone}</Text>}
            {personalInfo.city && <Text>• {personalInfo.city}</Text>}
            {personalInfo.linkedin && <Text>• {personalInfo.linkedin}</Text>}
          </View>
          {personalInfo.summary && (
             <Text style={{ marginTop: 10, fontSize: 10 }}>{personalInfo.summary}</Text>
          )}
        </View>

        {sections
          .filter((s) => s.isVisible)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.type === 'skills' ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {section.items.map((item) => {
                     const style = section.style || 'dots';
                     let level = 3;
                     if (item.subtitle === 'Beginner') level = 2;
                     if (item.subtitle === 'Intermediate') level = 3;
                     if (item.subtitle === 'Advanced') level = 4;
                     if (item.subtitle === 'Expert') level = 5;

                     return (
                      <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', width: '45%', marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 10, flex: 1 }}>{item.title}</Text>
                        
                        {style === 'dots' && (
                           <View style={{ flexDirection: 'row', gap: 2 }}>
                             {[1, 2, 3, 4, 5].map((i) => (
                               <View
                                 key={i}
                                 style={{
                                   width: 6,
                                   height: 6,
                                   borderRadius: 3,
                                   backgroundColor: i <= level ? '#1f2937' : '#e5e7eb'
                                 }}
                               />
                             ))}
                           </View>
                        )}

                        {style === 'bar' && (
                           <View style={{ width: 60, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }}>
                             <View 
                               style={{ 
                                 width: `${(level / 5) * 100}%`, 
                                 height: '100%', 
                                 backgroundColor: '#1f2937', 
                                 borderRadius: 2 
                               }} 
                             />
                           </View>
                        )}

                        {style === 'text' && (
                           <Text style={{ fontSize: 9, color: '#6b7280' }}>{item.subtitle}</Text>
                        )}
                      </View>
                     );
                  })}
                </View>
              ) : (
                section.items.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.date}>{item.date}</Text>
                    </View>
                    {item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
                    {item.description && <Text style={styles.description}>{item.description}</Text>}
                  </View>
                ))
              )}
            </View>
          ))}
      </Page>
    </Document>
  );
};

const PDFExport: React.FC<{ data: ResumeData }> = ({ data }) => {
  const [isClient, setIsClient] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExport = async () => {
    try {
      setIsGenerating(true);
      const blob = await pdf(<ResumeDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.personalInfo.fullName || 'resume'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isClient) {
    return (
      <Button disabled>
        <Download className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
    );
  }

  return (
    <Button onClick={handleExport} disabled={isGenerating}>
      {isGenerating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isGenerating ? 'Generating...' : 'Export PDF'}
    </Button>
  );
};

export default PDFExport;
