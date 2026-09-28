"use client";

import React, { useState } from 'react';

type Lang = 'de' | 'en';

/**
 * One piece of a section. Kept as data so both languages share one renderer
 * and cannot drift apart structurally.
 */
type Block =
    | { type: 'h3'; text: string }
    | { type: 'p'; text: string }
    | { type: 'list'; items: string[] }
    | { type: 'link'; href: string; label: string };

interface Section {
    title: string;
    blocks: Block[];
}

interface PolicyContent {
    title: string;
    sections: Section[];
    lastUpdated: string;
}

// The global stylesheet strips link styling, so external links are marked here.
const linkStyle: React.CSSProperties = {
    color: 'var(--primary-color)',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
};

const CONTACT_EMAIL = 'legal@mensamate.ch';

const content: Record<Lang, PolicyContent> = {
    de: {
        title: 'Datenschutzerklärung',
        sections: [
            {
                title: '1. Das Wichtigste in Kürze',
                blocks: [
                    { type: 'p', text: 'Mensa Mate ist so gebaut, dass möglichst wenige Daten über Sie anfallen:' },
                    {
                        type: 'list',
                        items: [
                            'Es gibt keine Benutzerkonten und kein Login.',
                            'Ihre Einstellungen (inkl. Allergene) bleiben auf Ihrem Gerät und werden nicht an uns übermittelt.',
                            'Wir setzen keine Tracking- oder Werbe-Cookies ein und erstellen keine Profile.',
                            'Die Nutzungsstatistik ist anonym und cookielos.',
                            'Wir verkaufen keine Daten und geben sie nicht zu Werbezwecken weiter.',
                        ],
                    },
                    { type: 'p', text: 'Diese Datenschutzerklärung richtet sich nach dem Schweizer Bundesgesetz über den Datenschutz (DSG) und, soweit anwendbar, nach der EU-Datenschutz-Grundverordnung (DSGVO).' },
                ],
            },
            {
                title: '2. Verantwortliche Stelle',
                blocks: [
                    { type: 'p', text: 'Verantwortlich für die Bearbeitung von Personendaten auf dieser Website ist:' },
                    { type: 'list', items: ['Alejandro Pérez', '8049 Zürich, Schweiz', `E-Mail: ${CONTACT_EMAIL}`] },
                    { type: 'p', text: 'Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte können Sie sich jederzeit an diese E-Mail-Adresse wenden.' },
                ],
            },
            {
                title: '3. Welche Daten wir bearbeiten',
                blocks: [
                    { type: 'h3', text: 'Hosting und Server-Logdateien (Vercel)' },
                    { type: 'p', text: 'Die Website wird bei Vercel Inc. (USA) betrieben. Bei jedem Aufruf übermittelt Ihr Browser technisch bedingt Daten, die Vercel in Logdateien erfasst: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, Referrer sowie Browser und Betriebssystem. Diese Daten dienen ausschliesslich der Auslieferung, dem sicheren Betrieb und der Fehleranalyse der Website und werden von Vercel nur für begrenzte Zeit aufbewahrt. Wir führen sie nicht mit anderen Daten zusammen.' },
                    { type: 'h3', text: 'Einstellungen auf Ihrem Gerät' },
                    { type: 'p', text: 'Ihre Einstellungen speichern wir im lokalen Speicher (Local Storage) Ihres Browsers: Farbschema, Standard-Mensa, Reihenfolge und Sichtbarkeit der Standorte, ausgewählte Allergene sowie ob Sie den Hinweis zur Studierendenkarte bereits gesehen haben. Diese Daten verlassen Ihr Gerät nicht und sind für uns nicht einsehbar. Das gilt insbesondere für Ihre Allergene, die Rückschlüsse auf Ihre Gesundheit zulassen können.' },
                    { type: 'p', text: 'Einzige Ausnahme ist die gewählte Standard-Mensa: Sie wird zusätzlich als Cookie (Name «defaultFacility», Laufzeit ein Jahr) gespeichert, damit beim Öffnen der App direkt die richtige Mensa angezeigt wird. Das Cookie enthält nur die Nummer der Mensa und wird nicht zur Wiedererkennung oder Analyse verwendet.' },
                    { type: 'p', text: 'Sie können diese Daten jederzeit löschen, indem Sie die Website-Daten in Ihrem Browser entfernen.' },
                    { type: 'h3', text: 'Menüdaten' },
                    { type: 'p', text: 'Die Menüs beziehen wir über unseren Server von der ETH Zürich und von Food2050. Dabei werden keine Daten über Sie an diese Stellen übermittelt; unser Server fragt lediglich die gewählte Mensa und das Datum ab.' },
                ],
            },
            {
                title: '4. Nutzungsstatistik und Drittanbieter',
                blocks: [
                    { type: 'h3', text: 'Vercel Web Analytics' },
                    { type: 'p', text: 'Um zu verstehen, welche Seiten und Mensen genutzt werden, verwenden wir Vercel Web Analytics (Vercel Inc., USA). Dabei werden keine Cookies gesetzt. Besuche werden über einen aus der eingehenden Anfrage gebildeten Hash erkannt, der nach 24 Stunden automatisch verworfen wird. Pro Seitenaufruf können erfasst werden: Zeitpunkt, aufgerufene Seite, Referrer, ungefährer Standort (Land, Region, Stadt), Betriebssystem, Browser und Gerätetyp. Diese Daten werden nicht mit Ihrer IP-Adresse verknüpft gespeichert und erlauben keine Identifizierung einzelner Personen. Wir sehen nur zusammengefasste Zahlen.' },
                    { type: 'link', href: 'https://vercel.com/docs/analytics/privacy-policy', label: 'Datenschutzhinweise von Vercel Web Analytics' },
                    { type: 'h3', text: 'Bildauslieferung über wsrv.nl' },
                    { type: 'p', text: 'Die Fotos der Menüs lädt Ihr Browser direkt beim Bild-Dienst wsrv.nl, der sie verkleinert und in ein platzsparendes Format umwandelt. Dabei erhält wsrv.nl technisch bedingt Ihre IP-Adresse, Browsertyp und -version, die angefragte Bildadresse sowie den Zeitpunkt des Abrufs. Laut wsrv.nl werden diese Protokolldaten nach 7 Tagen automatisch gelöscht. wsrv.nl nutzt das Content-Delivery-Netzwerk von Cloudflare, Inc. (USA).' },
                    { type: 'link', href: 'https://github.com/weserv/images/blob/5.x/Privacy-Policy.md', label: 'Datenschutzerklärung von wsrv.nl' },
                    { type: 'h3', text: 'Externe Links und Feedback' },
                    { type: 'p', text: 'Die Website enthält Links zu externen Angeboten, etwa zur ETH EduApp (Studierendenkarte), zu GitHub und gegebenenfalls zu einem Feedback-Formular. Erst wenn Sie einen solchen Link öffnen, werden Daten an den jeweiligen Anbieter übermittelt; dafür gilt dessen Datenschutzerklärung. Angaben, die Sie im Feedback-Formular machen, verwenden wir nur zur Bearbeitung Ihres Feedbacks.' },
                ],
            },
            {
                title: '5. Bekanntgabe ins Ausland',
                blocks: [
                    { type: 'p', text: 'Vercel und Cloudflare haben ihren Sitz in den USA und betreiben Server weltweit. Personendaten (insbesondere IP-Adressen in Logdateien) können daher in die USA und in andere Länder übermittelt werden. Beide Unternehmen sind unter dem Swiss-U.S. Data Privacy Framework zertifiziert, das der Bundesrat als angemessenen Datenschutz anerkannt hat. Soweit Daten in andere Länder ohne angemessenen Datenschutz gelangen, stützen sich die Anbieter auf die Standardvertragsklauseln der EU-Kommission, die vom Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) anerkannt sind.' },
                ],
            },
            {
                title: '6. Zweck und Rechtsgrundlagen',
                blocks: [
                    { type: 'p', text: 'Wir bearbeiten Daten nur, um die Website bereitzustellen, sicher zu betreiben und anhand anonymer Statistiken zu verbessern. Es findet kein Profiling und keine automatisierte Einzelentscheidung statt.' },
                    { type: 'p', text: 'Soweit die DSGVO anwendbar ist, stützen wir die beschriebenen Bearbeitungen auf unser berechtigtes Interesse an einer funktionierenden, sicheren und schnellen Website (Art. 6 Abs. 1 lit. f DSGVO). Das Speichern Ihrer Einstellungen auf Ihrem Gerät ist für die von Ihnen gewünschte Funktion erforderlich.' },
                ],
            },
            {
                title: '7. Ihre Rechte',
                blocks: [
                    { type: 'p', text: 'Sie haben nach DSG und DSGVO insbesondere das Recht auf:' },
                    {
                        type: 'list',
                        items: [
                            'Auskunft darüber, ob und welche Personendaten wir über Sie bearbeiten',
                            'Berichtigung unrichtiger Daten',
                            'Löschung Ihrer Daten',
                            'Widerspruch gegen die Bearbeitung',
                            'Herausgabe oder Übertragung Ihrer Daten',
                        ],
                    },
                    { type: 'p', text: `Da wir keine Konten führen und Ihre Einstellungen nur auf Ihrem Gerät liegen, besitzen wir selbst in der Regel keine Daten, die wir Ihnen zuordnen könnten. Anfragen richten Sie bitte an ${CONTACT_EMAIL}.` },
                    { type: 'h3', text: 'Beschwerderecht' },
                    { type: 'p', text: 'Sie können sich bei der zuständigen Aufsichtsbehörde beschweren. In der Schweiz ist dies der Eidgenössische Datenschutz- und Öffentlichkeitsbeauftragte (EDÖB), Feldeggweg 1, 3003 Bern. Personen in der EU können sich an die Datenschutzbehörde ihres Wohnsitzlandes wenden.' },
                    { type: 'link', href: 'https://www.edoeb.admin.ch', label: 'www.edoeb.admin.ch' },
                ],
            },
            {
                title: '8. Änderungen',
                blocks: [
                    { type: 'p', text: 'Wir passen diese Datenschutzerklärung an, wenn sich die Website oder die Rechtslage ändert. Es gilt die jeweils hier veröffentlichte Fassung.' },
                ],
            },
        ],
        lastUpdated: 'Stand: 28. September 2026',
    },
    en: {
        title: 'Privacy Policy',
        sections: [
            {
                title: '1. Summary',
                blocks: [
                    { type: 'p', text: 'Mensa Mate is built to collect as little data about you as possible:' },
                    {
                        type: 'list',
                        items: [
                            'There are no user accounts and no login.',
                            'Your settings (including allergens) stay on your device and are never sent to us.',
                            'We use no tracking or advertising cookies and create no profiles.',
                            'Usage statistics are anonymous and cookieless.',
                            'We do not sell data or share it for advertising.',
                        ],
                    },
                    { type: 'p', text: 'This privacy policy is based on the Swiss Federal Act on Data Protection (FADP) and, where applicable, the EU General Data Protection Regulation (GDPR).' },
                ],
            },
            {
                title: '2. Controller',
                blocks: [
                    { type: 'p', text: 'The controller responsible for processing personal data on this website is:' },
                    { type: 'list', items: ['Alejandro Pérez', '8049 Zürich, Switzerland', `Email: ${CONTACT_EMAIL}`] },
                    { type: 'p', text: 'You can contact this address at any time with questions about data protection or to exercise your rights.' },
                ],
            },
            {
                title: '3. What Data We Process',
                blocks: [
                    { type: 'h3', text: 'Hosting and server log files (Vercel)' },
                    { type: 'p', text: 'The website is hosted by Vercel Inc. (USA). With every request, your browser necessarily transmits data that Vercel records in log files: IP address, date and time, requested address, referrer, and browser and operating system. This data is used solely to deliver the website, operate it securely and analyse errors, and Vercel keeps it only for a limited time. We do not combine it with other data.' },
                    { type: 'h3', text: 'Settings on your device' },
                    { type: 'p', text: 'Your settings are stored in your browser\'s local storage: colour scheme, default restaurant, order and visibility of locations, selected allergens, and whether you have seen the student card notice. This data never leaves your device and we cannot see it. This applies in particular to your allergens, which may reveal information about your health.' },
                    { type: 'p', text: 'The only exception is your default restaurant: it is also stored as a cookie (named "defaultFacility", valid for one year) so the app can open directly on the right restaurant. The cookie contains only the restaurant\'s number and is not used to recognise you or for analytics.' },
                    { type: 'p', text: 'You can delete this data at any time by clearing this website\'s data in your browser.' },
                    { type: 'h3', text: 'Menu data' },
                    { type: 'p', text: 'Our server fetches the menus from ETH Zurich and Food2050. No data about you is sent to them; our server only requests the selected restaurant and date.' },
                ],
            },
            {
                title: '4. Usage Statistics and Third-Party Services',
                blocks: [
                    { type: 'h3', text: 'Vercel Web Analytics' },
                    { type: 'p', text: 'To understand which pages and restaurants are used, we use Vercel Web Analytics (Vercel Inc., USA). It does not set any cookies. Visits are recognised by a hash created from the incoming request, which is automatically discarded after 24 hours. For each page view, the following may be recorded: timestamp, page visited, referrer, approximate location (country, region, city), operating system, browser and device type. This data is not stored in association with your IP address and does not allow individuals to be identified. We only see aggregated numbers.' },
                    { type: 'link', href: 'https://vercel.com/docs/analytics/privacy-policy', label: 'Vercel Web Analytics privacy information' },
                    { type: 'h3', text: 'Image delivery via wsrv.nl' },
                    { type: 'p', text: 'Your browser loads menu photos directly from the image service wsrv.nl, which resizes them and converts them to a smaller file format. In doing so, wsrv.nl necessarily receives your IP address, browser type and version, the requested image address, and the time of the request. According to wsrv.nl, these log data are automatically deleted after 7 days. wsrv.nl uses the content delivery network of Cloudflare, Inc. (USA).' },
                    { type: 'link', href: 'https://github.com/weserv/images/blob/5.x/Privacy-Policy.md', label: 'wsrv.nl privacy policy' },
                    { type: 'h3', text: 'External links and feedback' },
                    { type: 'p', text: 'The website contains links to external services, such as the ETH EduApp (student card), GitHub and, where available, a feedback form. Data is only sent to these providers once you open such a link, and their privacy policies apply. We use information you enter in the feedback form only to handle your feedback.' },
                ],
            },
            {
                title: '5. Disclosure Abroad',
                blocks: [
                    { type: 'p', text: 'Vercel and Cloudflare are based in the USA and operate servers worldwide. Personal data (in particular IP addresses in log files) may therefore be transferred to the USA and other countries. Both companies are certified under the Swiss-U.S. Data Privacy Framework, which the Swiss Federal Council has recognised as providing adequate data protection. Where data reaches other countries without adequate protection, the providers rely on the European Commission\'s standard contractual clauses, which are recognised by the Swiss Federal Data Protection and Information Commissioner (FDPIC).' },
                ],
            },
            {
                title: '6. Purpose and Legal Basis',
                blocks: [
                    { type: 'p', text: 'We only process data to provide the website, operate it securely, and improve it using anonymous statistics. There is no profiling and no automated individual decision-making.' },
                    { type: 'p', text: 'Where the GDPR applies, the processing described here is based on our legitimate interest in a functioning, secure and fast website (Art. 6(1)(f) GDPR). Storing your settings on your device is necessary for the functionality you request.' },
                ],
            },
            {
                title: '7. Your Rights',
                blocks: [
                    { type: 'p', text: 'Under the FADP and the GDPR you have, in particular, the right to:' },
                    {
                        type: 'list',
                        items: [
                            'information about whether and which personal data we process about you',
                            'rectification of inaccurate data',
                            'erasure of your data',
                            'object to the processing',
                            'receive or transfer your data',
                        ],
                    },
                    { type: 'p', text: `Since we do not keep accounts and your settings exist only on your device, we generally hold no data that we could attribute to you. Please send requests to ${CONTACT_EMAIL}.` },
                    { type: 'h3', text: 'Right to lodge a complaint' },
                    { type: 'p', text: 'You can lodge a complaint with the competent supervisory authority. In Switzerland, this is the Federal Data Protection and Information Commissioner (FDPIC), Feldeggweg 1, 3003 Bern. People in the EU can contact the data protection authority of their country of residence.' },
                    { type: 'link', href: 'https://www.edoeb.admin.ch', label: 'www.edoeb.admin.ch' },
                ],
            },
            {
                title: '8. Changes',
                blocks: [
                    { type: 'p', text: 'We update this privacy policy when the website or the law changes. The version published here applies.' },
                ],
            },
        ],
        lastUpdated: 'Last updated: 28 September 2026',
    },
};

function renderBlock(block: Block, key: number) {
    switch (block.type) {
        case 'h3':
            return <h3 key={key} style={{ margin: '1rem 0 0.5rem', fontWeight: 600 }}>{block.text}</h3>;
        case 'p':
            return <p key={key} style={{ marginBottom: '0.75rem' }}>{block.text}</p>;
        case 'list':
            return (
                <ul key={key} style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
                    {block.items.map(item => <li key={item} style={{ marginBottom: '0.25rem' }}>{item}</li>)}
                </ul>
            );
        case 'link':
            return (
                <p key={key} style={{ marginBottom: '0.75rem' }}>
                    <a href={block.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                        {block.label}
                    </a>
                </p>
            );
    }
}

export default function PrivacyPage() {
    const [lang, setLang] = useState<Lang>('de');
    const t = content[lang];

    const langButtonStyle = (active: boolean): React.CSSProperties => ({
        padding: '0.4rem 0.8rem',
        background: active ? 'var(--text-color, #2d3436)' : 'var(--gray-light, #dfe6e9)',
        color: active ? 'var(--card-bg, #ffffff)' : 'var(--text-color, #2d3436)',
        border: 'none',
        borderRadius: 'var(--radius, 12px)',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    });

    return (
        // `lang` lets the browser hyphenate long German words correctly.
        <div lang={lang} style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ margin: 0, minWidth: 0, hyphens: 'auto', overflowWrap: 'break-word' }}>{t.title}</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setLang('de')} style={langButtonStyle(lang === 'de')} aria-pressed={lang === 'de'}>
                        DE
                    </button>
                    <button onClick={() => setLang('en')} style={langButtonStyle(lang === 'en')} aria-pressed={lang === 'en'}>
                        EN
                    </button>
                </div>
            </div>

            {t.sections.map(section => (
                <section key={section.title} style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>{section.title}</h2>
                    {section.blocks.map(renderBlock)}
                </section>
            ))}

            <p style={{ color: 'var(--gray-dark)', fontSize: '0.9rem' }}>{t.lastUpdated}</p>
        </div>
    );
}
