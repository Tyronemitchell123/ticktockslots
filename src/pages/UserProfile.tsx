import React, { useState } from 'react';

// Define TypeScript types for user
interface UserProfile {
    name: string;
    email: string;
    phone: string;
    investableAssets: number;
    membershipLevel: string;
    joinDate: string;
    preferences: {
        notifications: boolean;
        newsletter: boolean;
        twoFactorAuthentication: boolean;
    };
}

const UserProfile: React.FC = () => {
    const [user, setUser] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        investableAssets: 0,
        membershipLevel: '',
        joinDate: '',
        preferences: {
            notifications: false,
            newsletter: false,
            twoFactorAuthentication: false,
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = () => {
        // Save user profile logic here
        console.log('User profile saved:', user);
    };

    const handlePasswordChange = () => {
        // Password change logic here
    };

    const handleLogout = () => {
        // Logout logic here
    };

    return (
        <div>
            <h1>User Profile</h1>
            <form>
                <label>Name:</label>
                <input type="text" name="name" value={user.name} onChange={handleChange} />
                <label>Email:</label>
                <input type="email" name="email" value={user.email} onChange={handleChange} />
                <label>Phone:</label>
                <input type="tel" name="phone" value={user.phone} onChange={handleChange} />
                <label>Investable Assets:</label>
                <input type="number" name="investableAssets" value={user.investableAssets} onChange={handleChange} />
                <label>Membership Level:</label>
                <input type="text" name="membershipLevel" value={user.membershipLevel} onChange={handleChange} />
                <label>Join Date:</label>
                <input type="date" name="joinDate" value={user.joinDate} onChange={handleChange} />
                <h2>Preferences</h2>
                <label>
                    Notifications:
                    <input type="checkbox" name="notifications" checked={user.preferences.notifications} onChange={handleChange} />
                </label>
                <label>
                    Newsletter Subscription:
                    <input type="checkbox" name="newsletter" checked={user.preferences.newsletter} onChange={handleChange} />
                </label>
                <label>
                    Two-Factor Authentication:
                    <input type="checkbox" name="twoFactorAuthentication" checked={user.preferences.twoFactorAuthentication} onChange={handleChange} />
                </label>
                <button type="button" onClick={handleSave}>Save</button>
                <button type="button" onClick={handlePasswordChange}>Change Password</button>
                <button type="button" onClick={handleLogout}>Logout</button>
            </form>
        </div>
    );
};

export default UserProfile;