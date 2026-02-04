// Simple test script to verify API endpoints
// Run with: node test-api.js

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
    console.log('Testing API endpoints...\n');

    try {
        // Test 1: Get all auctions
        console.log('1. Testing GET /auctions');
        const auctionsResponse = await fetch(`${API_BASE}/auctions`);
        const auctionsData = await auctionsResponse.json();
        console.log('Status:', auctionsResponse.status);
        console.log('Response:', JSON.stringify(auctionsData, null, 2));
        console.log('---\n');

        if (auctionsData.auctions && auctionsData.auctions.length > 0) {
            const firstAuction = auctionsData.auctions[0];
            const roomId = firstAuction.roomId;

            // Test 2: Get specific auction
            console.log(`2. Testing GET /auction/${roomId}`);
            const auctionResponse = await fetch(`${API_BASE}/auction/${roomId}`);
            const auctionData = await auctionResponse.json();
            console.log('Status:', auctionResponse.status);
            console.log('Response:', JSON.stringify(auctionData, null, 2));
            console.log('---\n');

            // Test 3: Get bid history
            console.log(`3. Testing GET /auction/${roomId}/bids`);
            const bidsResponse = await fetch(`${API_BASE}/auction/${roomId}/bids`);
            const bidsData = await bidsResponse.json();
            console.log('Status:', bidsResponse.status);
            console.log('Response:', JSON.stringify(bidsData, null, 2));
            console.log('---\n');
        }

    } catch (error) {
        console.error('Error testing API:', error.message);
    }
}

testAPI();