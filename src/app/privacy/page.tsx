"use client";

import React, { useState } from 'react';

type Lang = 'de' | 'en';

export default function PrivacyPage() {
    const [lang, setLang] = useState<Lang>('de');

    const content = {
        de: {
            title: "Datenschutzerklärung",
            sec1Title: "1. Datenschutz auf einen Blick",
            sec1Sub1: "Allgemeine Hinweise",
            sec1Text1: "Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.",
            sec1Sub2: "Datenerfassung auf dieser Website",
            sec1Text2: "Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen. Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst (z.B. Server-Log-Dateien).",
            sec2Title: "2. Allgemeine Hinweise und Pflichtinformationen",
            sec2Sub1: "Datenschutz",
            sec2Text1: "Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.",
            sec2Sub2: "Verantwortliche Stelle",
            sec2Text2: "Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:",
            sec2Team: "Alejandro Pérez",
            sec2Email: "E-Mail: legal@mensamate.ch",
            sec2Sub3: "Beschwerderecht bei der zuständigen Aufsichtsbehörde",
            sec2Text3: "Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde zu.",
            sec3Title: "3. Datenerfassung auf unserer Website",
            sec3Sub1: "Server-Log-Dateien",
            sec3Text1: "Der Provider der Seiten (Vercel) erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt.",
            sec3Sub2: "Cookies und Local Storage",
            sec3Text2: "Die Internetseiten verwenden teilweise so genannte Cookies oder Local Storage (z.B. um Ihre bevorzugte Mensa zu speichern). Diese richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Sie dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen."
        },
        en: {
            title: "Privacy Policy",
            sec1Title: "1. Privacy at a Glance",
            sec1Sub1: "General Information",
            sec1Text1: "The following notes provide a simple overview of what happens to your personal data when you visit our website. Personal data is any data with which you could be personally identified.",
            sec1Sub2: "Data Collection on This Website",
            sec1Text2: "The data processing on this website is carried out by the website operator. You can find their contact details in the site notice of this website. Your data is collected when you provide it to us. Other data is collected automatically or after your consent when you visit the website by our IT systems (e.g., server log files).",
            sec2Title: "2. General Notes and Mandatory Information",
            sec2Sub1: "Data Protection",
            sec2Text1: "The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations and this privacy policy.",
            sec2Sub2: "Responsible Party",
            sec2Text2: "The responsible party for data processing on this website is:",
            sec2Team: "Alejandro Pérez",
            sec2Email: "Email: legal@mensamate.ch",
            sec2Sub3: "Right to File Complaints with Regulatory Authorities",
            sec2Text3: "In the event of violations of the GDPR, data subjects are entitled to log a complaint with a supervisory authority.",
            sec3Title: "3. Data Collection on Our Website",
            sec3Sub1: "Server Log Files",
            sec3Text1: "The provider of the pages (Vercel) automatically collects and stores information in so-called server log files, which your browser automatically transmits to us.",
            sec3Sub2: "Cookies and Local Storage",
            sec3Text2: "Some of our web pages use cookies and local storage (e.g., to store your preferred dining hall). They do not cause any damage to your computer and do not contain viruses. They serve the purpose of making our offer more user-friendly, effective, and secure."
        }
    };

    const t = content[lang];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ margin: 0 }}>{t.title}</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setLang('de')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            background: lang === 'de' ? 'var(--text-color, #2d3436)' : 'var(--gray-light, #dfe6e9)',
                            color: lang === 'de' ? 'var(--card-bg, #ffffff)' : 'var(--text-color, #2d3436)',
                            border: 'none',
                            borderRadius: 'var(--radius, 12px)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        DE
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            background: lang === 'en' ? 'var(--text-color, #2d3436)' : 'var(--gray-light, #dfe6e9)',
                            color: lang === 'en' ? 'var(--card-bg, #ffffff)' : 'var(--text-color, #2d3436)',
                            border: 'none',
                            borderRadius: 'var(--radius, 12px)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        EN
                    </button>
                </div>
            </div>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>{t.sec1Title}</h2>
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t.sec1Sub1}</h3>
                <p style={{ marginBottom: '1rem' }}>
                    {t.sec1Text1}
                </p>
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t.sec1Sub2}</h3>
                <p>
                    {t.sec1Text2}
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>{t.sec2Title}</h2>
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t.sec2Sub1}</h3>
                <p style={{ marginBottom: '1rem' }}>
                    {t.sec2Text1}
                </p>
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t.sec2Sub2}</h3>
                <p style={{ marginBottom: '1rem' }}>
                    {t.sec2Text2}<br />
                    {t.sec2Team}<br />
                    {t.sec2Email}
                </p>
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t.sec2Sub3}</h3>
                <p>
                    {t.sec2Text3}
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>{t.sec3Title}</h2>
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t.sec3Sub1}</h3>
                <p style={{ marginBottom: '1rem' }}>
                    {t.sec3Text1}
                </p>
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t.sec3Sub2}</h3>
                <p>
                    {t.sec3Text2}
                </p>
            </section>
        </div>
    );
}
