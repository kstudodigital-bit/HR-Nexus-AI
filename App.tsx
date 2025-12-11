import React, { useState } from 'react';
import { AppView } from './types';
import Layout from './components/Layout';
import JobGenerator from './features/JobGenerator';
import ResumeAnalyzer from './features/ResumeAnalyzer';
import InterviewPrep from './features/InterviewPrep';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.JOB_GENERATOR);

  const renderContent = () => {
    switch (currentView) {
      case AppView.JOB_GENERATOR:
        return <JobGenerator />;
      case AppView.RESUME_ANALYZER:
        return <ResumeAnalyzer />;
      case AppView.INTERVIEW_PREP:
        return <InterviewPrep />;
      default:
        return <JobGenerator />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
