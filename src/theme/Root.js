import React from 'react';
import ChatWidget from '../components/ChatWidget';
import WelcomeRobot from '../components/WelcomeRobot';

// This component wraps the entire Docusaurus app
// It allows us to inject the ChatWidget and WelcomeRobot on every page
export default function Root({ children }) {
  return (
    <>
      {children}
      <ChatWidget />
      <WelcomeRobot />
    </>
  );
}
