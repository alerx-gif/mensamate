import styles from './page.module.css';

export default function Loading() {
    return (
        <div className={styles.main}>
            <header className={styles.header}>
                <div style={{ padding: '8px 16px', background: 'var(--border-color)', borderRadius: '20px', width: '150px', height: '36px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                <div style={{ marginTop: '1rem', background: 'var(--border-color)', height: '2.5rem', width: '50%', maxWidth: '400px', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', padding: '0 20px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{
                        backgroundColor: 'var(--bg-color)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        padding: '20px',
                        animation: 'pulse 1.5s infinite ease-in-out',
                        animationDelay: `${i * 0.15}s`
                    }}>
                        <div style={{ height: '32px', width: '40%', backgroundColor: 'var(--border-color)', borderRadius: '6px', marginBottom: '20px' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[1, 2].map((j) => (
                                <div key={j} style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--border-color)', borderRadius: '8px', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ height: '16px', width: '30%', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginBottom: '8px' }} />
                                        <div style={{ height: '20px', width: '90%', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginBottom: '8px' }} />
                                        <div style={{ height: '14px', width: '50%', backgroundColor: 'var(--border-color)', borderRadius: '4px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}} />
        </div>
    );
}
