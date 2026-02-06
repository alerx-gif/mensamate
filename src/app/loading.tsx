import styles from './page.module.css';

export default function Loading() {
    return (
        <div className={styles.main}>
            {/* Header skeleton */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
            }}>
                <div style={{
                    width: '200px',
                    height: '28px',
                    backgroundColor: 'var(--skeleton-bg, #e0e0e0)',
                    borderRadius: '8px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }} />
                <div style={{
                    width: '150px',
                    height: '18px',
                    backgroundColor: 'var(--skeleton-bg, #e0e0e0)',
                    borderRadius: '6px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }} />
            </div>

            {/* Menu skeleton cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: 'var(--card-bg, white)',
                            borderRadius: '12px',
                            padding: '1rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}
                    >
                        {/* Image skeleton */}
                        <div style={{
                            width: '100%',
                            height: '120px',
                            backgroundColor: 'var(--skeleton-bg, #e0e0e0)',
                            borderRadius: '8px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                        {/* Title skeleton */}
                        <div style={{
                            width: '70%',
                            height: '20px',
                            backgroundColor: 'var(--skeleton-bg, #e0e0e0)',
                            borderRadius: '6px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                        {/* Description skeleton */}
                        <div style={{
                            width: '100%',
                            height: '14px',
                            backgroundColor: 'var(--skeleton-bg, #e0e0e0)',
                            borderRadius: '4px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                        <div style={{
                            width: '85%',
                            height: '14px',
                            backgroundColor: 'var(--skeleton-bg, #e0e0e0)',
                            borderRadius: '4px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}
