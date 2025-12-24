import React from 'react';
import ColorModeToggle from '@theme-original/Navbar/ColorModeToggle';
import UserProfile from '../../../components/UserProfile';
import styles from './styles.module.css';

export default function ColorModeToggleWrapper(props) {
  return (
    <div className={styles.navbarControls}>
      <UserProfile />
      <ColorModeToggle {...props} />
    </div>
  );
}
