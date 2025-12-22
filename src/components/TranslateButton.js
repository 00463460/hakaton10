import { useEffect, useState } from 'react';
import styles from './TranslateButton.module.css';

export default function TranslateButton() {
  const [isUrdu, setIsUrdu] = useState(false);

  useEffect(() => {
    // Check if page is already translated on mount
    const checkTranslation = () => {
      const htmlElement = document.documentElement;
      const isTranslated = htmlElement.classList.contains('translated-ltr') ||
                          htmlElement.classList.contains('translated-rtl') ||
                          htmlElement.lang !== 'en';
      setIsUrdu(isTranslated);
    };

    checkTranslation();

    // Add Google Translate script
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // Initialize Google Translate
    window.googleTranslateElementInit = function() {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'ur,en',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };
  }, []);

  const handleTranslate = () => {
    // Method 1: Try to use Google Translate cookie method
    const translateToCookie = (lang) => {
      const host = window.location.hostname;
      const cookieName = 'googtrans';
      const cookieValue = lang ? `/en/${lang}` : '';

      // Set the cookie
      document.cookie = `${cookieName}=${cookieValue};path=/;domain=${host}`;
      document.cookie = `${cookieName}=${cookieValue};path=/;domain=.${host}`;

      // Reload the page to apply translation
      window.location.reload();
    };

    // Method 2: Try to find and click the select if it exists
    const trySelectMethod = () => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = isUrdu ? 'en' : 'ur';
        select.dispatchEvent(new Event('change'));
        setIsUrdu(!isUrdu);
        return true;
      }
      return false;
    };

    // Try select method first, fall back to cookie method
    if (!trySelectMethod()) {
      const newLang = isUrdu ? '' : 'ur';
      translateToCookie(newLang);
    }
  };

  return (
    <>
      {/* Google Translate Element - Will be populated by Google */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* Floating Translate Button */}
      <button
        className={styles.translateButton}
        onClick={handleTranslate}
        title="Translate to Urdu / English"
        aria-label="Translate website"
      >
        <span className={styles.icon}>🌐</span>
        <span className={styles.label}>{isUrdu ? 'English' : 'اردو'}</span>
      </button>
    </>
  );
}
