'use client';

import React, { useEffect } from 'react';
import { ResumeProvider, useResume } from '@/context/ResumeContext';
import ResumeBuilderLayout from '@/components/resume-builder/ResumeBuilderLayout';
import { useParams } from 'next/navigation';

const ResumeBuilderContent = () => {
  const { loadResume } = useResume();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id && id !== 'new') {
      loadResume(id);
    }
  }, [id, loadResume]);

  return <ResumeBuilderLayout />;
};

const ResumeBuilderPage = () => {
  return (
    <ResumeProvider>
      <ResumeBuilderContent />
    </ResumeProvider>
  );
};

export default ResumeBuilderPage;
