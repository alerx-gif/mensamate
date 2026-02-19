import React from 'react';

export default function ContentSkeleton() {
    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'pulse 1.5s infinite ease-in-out' }}>
                <div style={{ height: '2rem', width: '60%', backgroundColor: 'var(--border-color)', margin: '0 auto', borderRadius: '4px', marginBottom: '0.5rem' }} />
                <div style={{ height: '1rem', width: '40%', backgroundColor: 'var(--border-color)', margin: '0 auto', borderRadius: '4px' }} />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                padding: '0 20px'
            }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                        backgroundColor: 'var(--bg-color)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        animation: 'pulse 1.5s infinite ease-in-out',
                        animationDelay: `${i * 0.1}s`
                    }}>
                        <div style={{ height: '200px', backgroundColor: 'var(--border-color)' }} />
                        <div style={{ padding: '16px' }}>
                            <div style={{ height: '1.5rem', width: '80%', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginBottom: '1rem' }} />
                            <div style={{ height: '1rem', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                            <div style={{ height: '1rem', width: '60%', backgroundColor: 'var(--border-color)', borderRadius: '4px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
