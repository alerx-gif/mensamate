'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Facility } from '@/types/eth';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
    onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const { username, signInWithUsername, isLoading } = useAuth();
    const [syncInput, setSyncInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [openSection, setOpenSection] = useState<'preferences' | 'sync' | null>('preferences');

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [defaultFacility, setDefaultFacility] = useState<string>('');

    useEffect(() => {
        // Fetch facilities
        fetch('/api/facilities')
            .then(res => res.json())
            .then(data => {
                setFacilities(data);
            })
            .catch(err => console.error("Failed to fetch facilities", err));

        // Load existing preference
        const saved = localStorage.getItem('defaultFacility');
        if (saved) {
            setDefaultFacility(saved);
        }
    }, []);

    const handleSaveDefaultFacility = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setDefaultFacility(val);
        localStorage.setItem('defaultFacility', val);
    };

    const handleSync = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!syncInput || !syncInput.includes('#')) {
            setError("Please enter a valid Sync Code (e.g., HappyPanda#1234)");
            return;
        }

        const { error: syncError } = await signInWithUsername(syncInput.trim());

        if (syncError) {
            setError("Invalid Sync Code or network error.");
        } else {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    const copyToClipboard = () => {
        if (username) {
            navigator.clipboard.writeText(username);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        }
    };

    const toggleSection = (section: 'preferences' | 'sync') => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.dropdownHeader}>
                    <h2>Settings</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className={styles.dropdownBody}>
                    <div className={styles.accordionSection}>
                        <button className={styles.accordionHeader} onClick={() => toggleSection('preferences')}>
                            Preferences
                            <span className={`${styles.accordionIcon} ${openSection === 'preferences' ? styles.open : ''}`}>▼</span>
                        </button>
                        <div className={`${styles.accordionContent} ${openSection === 'preferences' ? styles.open : ''}`}>
                            <p className={styles.description} style={{ marginTop: '1rem' }}>
                                Choose your default favorite Mensa to show when you launch the app.
                            </p>
                            <select
                                className={styles.selectInput}
                                value={defaultFacility}
                                onChange={handleSaveDefaultFacility}
                            >
                                <option value="">None</option>
                                {facilities.map(f => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.accordionSection}>
                        <button className={styles.accordionHeader} onClick={() => toggleSection('sync')}>
                            Sync Data
                            <span className={`${styles.accordionIcon} ${openSection === 'sync' ? styles.open : ''}`}>▼</span>
                        </button>
                        <div className={`${styles.accordionContent} ${openSection === 'sync' ? styles.open : ''}`}>
                            <p className={styles.description} style={{ marginTop: '1rem' }}>
                                Your Sync Code securely saves your favorites on this device.
                            </p>
                            <div className={styles.codeContainer}>
                                <code className={styles.code}>{isLoading ? 'Loading...' : username}</code>
                                <button className={styles.iconButton} onClick={copyToClipboard} disabled={!username} title="Copy Sync Code">
                                    {success && !syncInput ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <p className={styles.description}>Restore from another device:</p>
                            <form className={styles.form} onSubmit={handleSync}>
                                <input
                                    type="text"
                                    placeholder="e.g. HappyPanda#1234"
                                    className={styles.input}
                                    value={syncInput}
                                    onChange={(e) => setSyncInput(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button type="submit" className={styles.buttonSecondary} disabled={isLoading || !syncInput}>
                                    {isLoading ? 'Syncing...' : 'Sync'}
                                </button>
                            </form>
                            {error && <p className={styles.error}>{error}</p>}
                            {success && syncInput && <p className={styles.successText}>Successfully synced!</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
