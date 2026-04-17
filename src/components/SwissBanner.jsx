import React from 'react';

export default function SwissBanner() {
  return (
    <>
      <div className="swiss-banner" id="swiss-origin-banner">
        <div className="swiss-banner-inner">
          <span className="swiss-banner-flag">🇨🇭</span>
          <span className="swiss-banner-text">Sourced from Switzerland</span>
          <span className="swiss-banner-flag">🇨🇭</span>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .swiss-banner {
          width: 100%;
          background: linear-gradient(135deg, #c8102e 0%, #a00d24 40%, #8b0a1e 100%);
          padding: 10px 16px;
          text-align: center;
          position: relative;
          overflow: hidden;
          z-index: 200;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .swiss-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .swiss-banner::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
        }

        .swiss-banner-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .swiss-banner-flag {
          font-size: 14px;
          animation: swissPulse 3s ease-in-out infinite;
        }

        .swiss-banner-text {
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #ffffff;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        @keyframes swissPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}} />
    </>
  );
}
