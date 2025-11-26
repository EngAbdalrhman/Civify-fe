'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import { ResumeData } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

// Register fonts
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Inter',
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
              {section.items.map((item) => (
                <View key={item.id} style={styles.item}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                  </View>
                  {item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
                  {item.description && <Text style={styles.description}>{item.description}</Text>}
                </View>
              ))}
            </View>
          ))}
      </Page>
    </Document>
  );
};

const PDFExport: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <PDFDownloadLink
      document={<ResumeDocument data={data} />}
      fileName={`${data.personalInfo.fullName || 'resume'}.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <Button disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Generating PDF...' : 'Export PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default PDFExport;
