'use client';

import React from 'react';
import styles from './ChangelogModal.module.css';
import changelogData from '../data/changelog.json';
import packageJson from '../../package.json';

interface ChangelogModalProps {
    onClose: () => void;
}

export default function ChangelogModal({ onClose }: ChangelogModalProps) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Changelog</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className={styles.body}>
                    <div style={{ marginBottom: '1rem', fontWeight: 'bold', color: 'var(--text-color, #333)' }}>
                        Current Version: v{packageJson.version}
                    </div>
                    {changelogData.map((release: any, index: number) => (
                        <div key={index} className={styles.versionBlock}>
                            <div className={styles.versionHeader}>
                                <span className={styles.versionNumber}>v{release.version}</span>
                                <span className={styles.versionDate}>{release.date}</span>
                            </div>
                            <ul className={styles.changesList}>
                                {release.changes.map((change: string, idx: number) => (
                                    <li key={idx}>{change}</li>
                                ))}
                            </ul>
                            {release.knownIssues && release.knownIssues.length > 0 && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <strong style={{ fontSize: '0.9rem', color: '#e74c3c' }}>Known Issues:</strong>
                                    <ul className={styles.changesList} style={{ color: '#e74c3c', fontSize: '0.85rem' }}>
                                        {release.knownIssues.map((issue: string, idx: number) => (
                                            <li key={idx}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
