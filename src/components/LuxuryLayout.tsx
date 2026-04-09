// LuxuryLayout.tsx - Luxury layout component
import React from 'react';
import './LuxuryLayout.css';

const LuxuryLayout: React.FC = ({ children }) => {
    return (
        <div className="luxury-layout">
            {children}
        </div>
    );
};

export default LuxuryLayout;
