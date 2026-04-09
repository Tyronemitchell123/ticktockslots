import React, { useState } from 'react';

const ServiceMatching = () => {
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [rating, setRating] = useState(0);

    const handleSearch = () => {
        // Implement AI-powered service matching logic here
    };

    return (
        <div className="luxury-styling">
            <h1>AI-Powered Service Matching</h1>
            <div className="filters">
                <select onChange={(e) => setCategory(e.target.value)} value={category}>
                    <option value="">Select Category</option>
                    <option value="category1">Category 1</option>
                    <option value="category2">Category 2</option>
                    {/* Add more categories as needed */}
                </select>

                <input
                    type="number"
                    placeholder="Max Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <select onChange={(e) => setRating(Number(e.target.value))} value={rating}>
                    <option value={0}>Select Rating</option>
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                </select>

                <button onClick={handleSearch}>Search</button>
            </div>
            {/* Display matched services here */}
        </div>
    );
};

export default ServiceMatching;