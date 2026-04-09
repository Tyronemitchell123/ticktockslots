import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import LuxuryLayout from '../components/LuxuryLayout';
import AIAssistant from '../components/AIAssistant';

interface DashboardStats {
    totalServices: number;
    activeAuctions: number;
    accountBalance: string;
    upcomingEvents: number;
}

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setData({
                totalServices: 24,
                activeAuctions: 5,
                accountBalance: '$15M',
                upcomingEvents: 3,
            });
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="loading">Loading your premium dashboard...</div>;
    }

    return (
        <LuxuryLayout>
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Welcome to Aurelia Private Concierge</h1>
                    <p>Your Personal Luxury Management Platform</p>
                </header>
                <section className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Services</h3>
                        <p className="stat-value">{data?.totalServices}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active Auctions</h3>
                        <p className="stat-value">{data?.activeAuctions}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Account Balance</h3>
                        <p className="stat-value">{data?.accountBalance}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Upcoming Events</h3>
                        <p className="stat-value">{data?.upcomingEvents}</p>
                    </div>
                </section>
                <section className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn">Browse Services</button>
                        <button className="action-btn">View Auctions</button>
                        <button className="action-btn">Manage Events</button>
                        <button className="action-btn">Payment Center</button>
                    </div>
                </section>
                <section className="ai-section">
                    <h2>Your AI Concierge Assistant</h2>
                    <AIAssistant />
                </section>
                <section className="recent-activity">
                    <h2>Recent Activity</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-title">Private Jet Charter</span>
                            <span className="activity-date">April 8, 2026</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-title">Luxury Yacht Rental</span>
                            <span className="activity-date">April 7, 2026</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-title">Michelin Star Dining</span>
                            <span className="activity-date">April 6, 2026</span>
                        </div>
                    </div>
                </section>
            </div>
        </LuxuryLayout>
    );
};

export default Dashboard;