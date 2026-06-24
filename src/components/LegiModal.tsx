'use client';

import React from 'react';
import styles from './LegiModal.module.css';

interface LegiModalProps {
    onClose: () => void;
}

export default function LegiModal({ onClose }: LegiModalProps) {
    const handleLogin = () => {
        localStorage.setItem('hasSeenLegiModal', 'true');
        window.open('https://eduapp.ethz.ch/eth-card', '_blank');
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>ETH Student Card</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.description}>
                        This creates a shortcut to your digital ETH Student Card (Legi).
                        <br /><br />
                        Log in once securely on the ETH EduApp. Afterwards, this serves as quick, one-click access to your card directly from Mensa Mate.
                    </p>
                    
                    <button className={styles.button} onClick={handleLogin}>
                        Log in on ETH EduApp
                        <svg className={styles.externalIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
