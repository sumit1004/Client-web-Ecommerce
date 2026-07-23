import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

const API_URL = 'http://localhost:5000/api';
let cookie = '';

async function runTests() {
  console.log('--- STARTING AUTH E2E TEST ---');

  try {
    // 1. Login
    console.log('\nTesting Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });
    console.log('Login Response:', loginRes.data);
    
    const setCookie = loginRes.headers['set-cookie'];
    if (setCookie) {
      cookie = setCookie[0].split(';')[0];
      console.log('✅ Cookie received:', cookie);
    } else {
      console.log('❌ No cookie received');
    }

    // 2. Auth/Me
    console.log('\nTesting /auth/me...');
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Cookie: cookie }
    });
    console.log('/auth/me Response:', meRes.data);
    console.log('✅ /auth/me succeeded');

    // 3. Dashboard Stats
    console.log('\nTesting Dashboard access...');
    const statsRes = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Cookie: cookie }
    });
    console.log('Dashboard Stats returned successfully.');
    console.log('✅ Protected Route succeeded');

    // 4. Logout
    console.log('\nTesting Logout...');
    const logoutRes = await axios.post(`${API_URL}/auth/logout`, {}, {
      headers: { Cookie: cookie }
    });
    console.log('Logout Response:', logoutRes.data);
    const logoutCookie = logoutRes.headers['set-cookie'];
    if (logoutCookie && logoutCookie[0].includes('token=;')) {
       console.log('✅ Cookie cleared successfully');
    }

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.response ? err.response.data : err.message);
  }
}

runTests();
