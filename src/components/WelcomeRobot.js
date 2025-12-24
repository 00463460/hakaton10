import React, { useState, useEffect } from 'react';
import styles from './WelcomeRobot.module.css';

export default function WelcomeRobot() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if the robot has already been shown in this session
    const robotShown = sessionStorage.getItem('welcomeRobotShown');

    if (!robotShown) {
      // Show the robot after a short delay
      const showTimer = setTimeout(() => {
        setIsVisible(true);

        // Speak the message
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance('This website is made by Kashan');
          utterance.lang = 'en-US';
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        }

        // Hide the robot after 5 seconds
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem('welcomeRobotShown', 'true');
          setHasShown(true);
        }, 5000);

        return () => clearTimeout(hideTimer);
      }, 500);

      return () => clearTimeout(showTimer);
    } else {
      setHasShown(true);
    }
  }, []);

  if (hasShown && !isVisible) {
    return null;
  }

  return (
    <div className={`${styles.robotContainer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.robot}>
        <div className={styles.robotHead}>
          <div className={styles.robotAntenna}>
            <div className={styles.antennaBall}></div>
          </div>
          <div className={styles.robotEyes}>
            <div className={styles.eye}></div>
            <div className={styles.eye}></div>
          </div>
          <div className={styles.robotMouth}></div>
        </div>
        <div className={styles.robotBody}>
          <div className={styles.bodyPanel}></div>
        </div>
        <div className={styles.robotArms}>
          <div className={styles.arm}></div>
          <div className={styles.arm}></div>
        </div>
      </div>

      <div className={styles.speechBubble}>
        <p>This website is made by <strong>Kashan</strong></p>
        <div className={styles.bubbleTail}></div>
      </div>

      <div className={styles.soundWaves}>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
      </div>
    </div>
  );
}
