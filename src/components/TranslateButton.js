import React, { useEffect } from 'react';
import styles from './TranslateButton.module.css';

export default function TranslateButton() {
  useEffect(() => {
    // Load Google Translate script
    const addScript = document.createElement('script');
    addScript.setAttribute(
      'src',
      '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    );
    document.body.appendChild(addScript);

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'ur,en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    return () => {
      // Cleanup
      const script = document.querySelector('script[src*="translate.google.com"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  const handleTranslate = () => {
    const translateElement = document.getElementById('google_translate_element');
    if (translateElement) {
      const select = translateElement.querySelector('select');
      if (select) {
        // Check current language
        const currentLang = select.value;
        if (currentLang === 'ur') {
          // Switch back to English
          select.value = 'en';
        } else {
          // Switch to Urdu
          select.value = 'ur';
        }
        select.dispatchEvent(new Event('change'));
      }
    }
  };

  return (
    <>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* Floating Translate Button */}
      <button
        className={styles.translateButton}
        onClick={handleTranslate}
        title="Translate to Urdu / English"
        aria-label="Translate website"
      >
        <span className={styles.icon}>🌐</span>
        <span className={styles.label}>اردو</span>
      </button>
    </>
  );
}
