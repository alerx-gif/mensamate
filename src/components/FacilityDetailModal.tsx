'use client';

import { Facility, OpeningHours } from '@/types/eth';
import styles from './FacilityDetailModal.module.css';

interface FacilityDetailModalProps {
    facility: Facility;
    openingHours?: OpeningHours[];
    onClose: () => void;
}

export default function FacilityDetailModal({ facility, openingHours, onClose }: FacilityDetailModalProps) {
    // Build location string
    const locationParts: string[] = [];
    if (facility.building) locationParts.push(`Building ${facility.building}`);
    if (facility.floor) locationParts.push(`Floor ${facility.floor}`);
    if (facility.roomNr) locationParts.push(`Room ${facility.roomNr}`);
    const locationString = locationParts.join(' • ');

    // Build address
    const addressParts: string[] = [];
    if (facility.addressLine2) addressParts.push(facility.addressLine2);
    if (facility.addressLine3) addressParts.push(facility.addressLine3);
    const addressString = addressParts.join(', ');

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerTop}>
                        <div>
                            <h2 className={styles.facilityName}>{facility.name}</h2>
                            <p className={styles.facilityType}>{facility.type}</p>
                        </div>
                        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                            ✕
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Location Section */}
                    {(locationString || addressString) && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>📍 Location</h3>
                            <div className={styles.infoCard}>
                                {locationString && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoValue}>{locationString}</span>
                                    </div>
                                )}
                                {addressString && (
                                    <div className={styles.infoRow}>
                                        <span style={{ color: 'var(--gray-dark)' }}>{addressString}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Opening Hours Section */}
                    {openingHours && openingHours.length > 0 && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>🕐 Opening Hours</h3>
                            <div className={styles.openingHoursGrid}>
                                {openingHours.map((oh, idx) => (
                                    <div key={idx}>
                                        <div className={styles.openingHourRow}>
                                            <span className={styles.mealTimeName}>Open</span>
                                            <span className={styles.mealTimeHours}>{oh.timeFrom} - {oh.timeTo}</span>
                                        </div>
                                        {oh.mealTimes?.map((mt, mtIdx) => (
                                            <div key={mtIdx} className={styles.openingHourRow} style={{ marginTop: '4px', background: '#f0f4f8' }}>
                                                <span className={styles.mealTimeName}>{mt.name}</span>
                                                <span className={styles.mealTimeHours}>{mt.timeFrom} - {mt.timeTo}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Section */}
                    {facility.phone && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>📞 Contact</h3>
                            <div className={styles.infoCard}>
                                <a href={`tel:${facility.phone}`} className={styles.linkButton}>
                                    {facility.phone}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Payment Options */}
                    {facility.paymentOptions && facility.paymentOptions.length > 0 && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>💳 Payment Options</h3>
                            <div className={styles.tagContainer}>
                                {facility.paymentOptions.map((payment) => (
                                    <span key={payment.code} className={`${styles.tag} ${styles.paymentTag}`}>
                                        {payment.descShort || payment.desc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Features */}
                    {facility.features && facility.features.length > 0 && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>✨ Features</h3>
                            <div className={styles.tagContainer}>
                                {facility.features.map((feature) => (
                                    <span key={feature.code} className={`${styles.tag} ${styles.featureTag}`}>
                                        {feature.descShort || feature.desc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Caterer Info */}
                    {facility.catererName && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>🍽️ Operated By</h3>
                            <div className={styles.catererInfo}>
                                {facility.catererUrl ? (
                                    <a href={facility.catererUrl} target="_blank" rel="noopener noreferrer">
                                        {facility.catererName}
                                    </a>
                                ) : (
                                    <span>{facility.catererName}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Official Website Link */}
                    {facility.facilityUrl && (
                        <div className={styles.section}>
                            <a
                                href={facility.facilityUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.linkButton}
                            >
                                🔗 View on ETH Website →
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
