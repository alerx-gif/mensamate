"use client";

import React, { useState } from 'react';
import styles from './FeedbackCaptcha.module.css';

interface FeedbackCaptchaProps {
    className?: string;
}

export default function FeedbackCaptcha({ className }: FeedbackCaptchaProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState(false);

    const openCaptcha = (e: React.MouseEvent) => {
        e.preventDefault();
        setNum1(Math.floor(Math.random() * 10) + 1);
        setNum2(Math.floor(Math.random() * 10) + 1);
        setAnswer('');
        setError(false);
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (parseInt(answer, 10) === num1 + num2) {
            setIsOpen(false);
            window.location.href = 'mailto:contact@mensamate.ch';
        } else {
            setError(true);
        }
    };

    return (
        <>
            <button onClick={openCaptcha} className={`${styles.button} ${className || ''}`}>
                <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                </svg>
                Feedback
            </button>

            {isOpen && (
                <div className={styles.overlay} onClick={() => setIsOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.title}>Anti-Spam Check</h3>
                        <p className={styles.description}>Please solve this simple math problem to send feedback:</p>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.captchaQuestion}>
                                {num1} + {num2} = ?
                            </div>
                            <input
                                type="number"
                                className={`${styles.input} ${error ? styles.inputError : ''}`}
                                value={answer}
                                onChange={(e) => {
                                    setAnswer(e.target.value);
                                    setError(false);
                                }}
                                placeholder="Your answer"
                                autoFocus
                                required
                            />
                            {error && <p className={styles.errorMessage}>Incorrect. Please try again.</p>}
                            <div className={styles.actions}>
                                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelButton}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitButton}>
                                    Verify
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
