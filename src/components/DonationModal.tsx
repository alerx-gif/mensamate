"use client";

import { useState } from 'react';
import styles from './DonationModal.module.css';

export default function DonationModal() {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    // Prevent closing when clicking inside the modal
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleTwintClick = () => {
        window.open('https://go.twint.ch/1/e/tw?tw=acq.hs6DYifaTzud-PdIFV1eQTnNvIfaAXR0sgqSYAGoLQIpCLx-I59B2TPSGPVFS1ED.', '_blank');
    };

    return (
        <>
            <button onClick={openModal} className={styles.triggerButton}>
                <span>☕</span>
                Support Me
            </button>

            {isOpen && (
                <div className={styles.overlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={handleModalClick}>
                        <button className={styles.closeButton} onClick={closeModal} aria-label="Close">
                            &times;
                        </button>

                        <div className={styles.content}>
                            <p className={styles.text}>
                                This app is student developed and free of charge and will stay that way.
                                With a small donation you can support the ongoing costs.
                            </p>

                            <button
                                className={styles.twintButton}
                                onClick={handleTwintClick}
                                aria-label="Pay with TWINT"
                            >
                                <img
                                    alt="Embedded TWINT button"
                                    src="https://go.twint.ch/static/img/button_dark_en.svg"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
