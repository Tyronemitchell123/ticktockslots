import React, { useEffect, useState } from 'react';

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
        return <div className="flex items-center justify-center min-h-screen text-foreground">Loading your premium dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Welcome to Aurelia Private Concierge</h1>
                    <p className="text-muted-foreground">Your Personal Luxury Management Platform</p>
                </header>
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Services', value: data?.totalServices },
                        { label: 'Active Auctions', value: data?.activeAuctions },
                        { label: 'Account Balance', value: data?.accountBalance },
                        { label: 'Upcoming Events', value: data?.upcomingEvents },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
                            <h3 className="text-sm text-muted-foreground">{stat.label}</h3>
                            <p className="text-2xl font-bold text-primary">{stat.value}</p>
                        </div>
                    ))}
                </section>
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        {['Browse Services', 'View Auctions', 'Manage Events', 'Payment Center'].map((action) => (
                            <button key={action} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                {action}
                            </button>
                        ))}
                    </div>
                </section>
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Activity</h2>
                    <div className="space-y-2">
                        {[
                            { title: 'Private Jet Charter', date: 'April 8, 2026' },
                            { title: 'Luxury Yacht Rental', date: 'April 7, 2026' },
                            { title: 'Michelin Star Dining', date: 'April 6, 2026' },
                        ].map((item) => (
                            <div key={item.title} className="flex justify-between items-center rounded-md border border-border bg-card px-4 py-3">
                                <span className="font-medium">{item.title}</span>
                                <span className="text-sm text-muted-foreground">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
