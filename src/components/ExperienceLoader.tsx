import React from 'react';

interface ExperienceLoaderProps {
  title?: string;
  subtitle?: string;
}

export const ExperienceLoader: React.FC<ExperienceLoaderProps> = ({
  title = 'Initializing Experience',
  subtitle = 'Preparing 3D environment...'
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#090D0E',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(255, 255, 255, 0.12)',
          borderTopColor: '#d9ff43',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '20px'
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontSize: '13px', color: '#94A3B8' }}>
        {subtitle}
      </div>
    </div>
  );
};
