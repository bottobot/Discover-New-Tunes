import React from 'react';
import styles from '../styles/LoadingAnimation.module.scss';

const LoadingAnimation = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p className={styles.loadingText}>Loading your lineup...</p>
    </div>
  );
};

export default LoadingAnimation;
