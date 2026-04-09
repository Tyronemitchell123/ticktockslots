import React, { ReactNode } from 'react';

interface LuxuryLayoutProps {
    children: ReactNode;
}

const LuxuryLayout: React.FC<LuxuryLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {children}
        </div>
    );
};

export default LuxuryLayout;
