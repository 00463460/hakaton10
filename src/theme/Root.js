import React from 'react';
import ChatWidget from '../components/ChatWidget';

// This component wraps the entire Docusaurus app
// It allows us to inject the ChatWidget on every page
export default function Root({ children }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
