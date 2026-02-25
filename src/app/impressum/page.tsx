import React from 'react';

export default function ImpressumPage() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1rem' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Impressum</h1>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Persönliche Angaben</h2>
                <p>
                    <strong>Alejandro Pérez</strong><br />
                    legal@mensamate.ch<br />
                    8049 Zürich<br />
                    Schweiz
                </p>
                <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    <em>MensaMate ist ein Studentenprojekt und steht in keiner Verbindung zur ETH Zürich oder der Universität Zürich.</em>
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Kontakt</h2>
                <p>
                    E-Mail: <a href="mailto:legal@mensamate.ch" style={{ textDecoration: 'underline' }}>legal@mensamate.ch</a><br />
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Verantwortlich für den Inhalt</h2>
                <p>
                    Alejandro Pérez<br />
                    legal@mensamate.ch
                </p>
            </section>

            <section>
                <h2 style={{ marginBottom: '1rem' }}>Haftung für Inhalte</h2>
                <p>
                    Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen. Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen. Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.
                </p>
            </section>
        </div>
    );
}
