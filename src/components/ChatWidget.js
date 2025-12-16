import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatWidget.module.css';

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.onrender.com'  // Replace with your deployed backend URL
  : 'http://localhost:8000';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI assistant for the Physical AI textbook. Ask me anything about humanoid robotics, ROS 2, vision-language-action models, or any chapter content!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Capture text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      if (text.length > 0 && text.length < 1000) {
        setSelectedText(text);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputValue,
          selected_text_context: selectedText || null,
          conversation_history: messages.slice(-6).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSelectedText(''); // Clear selected text after use
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please make sure the backend server is running at ' + BACKEND_URL,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearSelectedText = () => {
    setSelectedText('');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className={`${styles.chatButton} ${isOpen ? styles.chatButtonOpen : ''}`}
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className={styles.chatPanel}>
          {/* Chat Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderContent}>
              <div className={styles.chatHeaderIcon}>🤖</div>
              <div>
                <div className={styles.chatHeaderTitle}>Physical AI Assistant</div>
                <div className={styles.chatHeaderSubtitle}>Powered by Cohere & RAG</div>
              </div>
            </div>
          </div>

          {/* Selected Text Banner */}
          {selectedText && (
            <div className={styles.selectedTextBanner}>
              <div className={styles.selectedTextContent}>
                <span className={styles.selectedTextIcon}>📝</span>
                <span className={styles.selectedTextLabel}>Selected text:</span>
                <span className={styles.selectedTextPreview}>
                  {selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}
                </span>
              </div>
              <button
                onClick={clearSelectedText}
                className={styles.selectedTextClose}
                aria-label="Clear selected text"
              >
                ×
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  message.role === 'user' ? styles.messageUser : styles.messageAssistant
                } ${message.isError ? styles.messageError : ''}`}
              >
                <div className={styles.messageContent}>
                  {message.content}
                </div>

                {/* Show sources if available */}
                {message.sources && message.sources.length > 0 && (
                  <div className={styles.messageSources}>
                    <div className={styles.sourcesTitle}>📚 Sources:</div>
                    {message.sources.slice(0, 3).map((source, idx) => (
                      <div key={idx} className={styles.sourceItem}>
                        <span className={styles.sourceChapter}>{source.metadata?.chapter || 'Chapter'}</span>
                        <span className={styles.sourceScore}>Score: {(source.score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.messageTimestamp}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className={`${styles.message} ${styles.messageAssistant}`}>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputContainer}>
            <textarea
              ref={inputRef}
              className={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about any chapter content..."
              rows="1"
              disabled={isLoading}
            />
            <button
              className={styles.sendButton}
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          {/* Tips */}
          <div className={styles.chatTips}>
            💡 Tip: Select text on the page to ask questions about it!
          </div>
        </div>
      )}
    </>
  );
}
