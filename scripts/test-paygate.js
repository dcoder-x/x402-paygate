const fetch = require('node-fetch'); // Assuming node-fetch or global fetch available in Node 18+

async function runTest() {
    const baseUrl = 'http://localhost:3000';

    console.log('1. Registering API...');
    const regRes = await fetch(`${baseUrl}/api/paygate/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test API',
            originalUrl: 'https://jsonplaceholder.typicode.com',
            pricePerRequest: '1',
            stacksAddress: 'SP2J6ZS84BKXI3712JRKWBBZ3PHW3D80G53369D',
            network: 'testnet'
        })
    });

    const regData = await regRes.json();
    console.log('Registration Result:', regData);

    if (!regData.success) {
        console.error('Registration failed');
        return;
    }

    const apiId = regData.api.id;
    const wrapperUrl = `${baseUrl}/w/${apiId}/todos/1`;

    console.log(`\n2. Requesting Wrapper URL (Expect 402): ${wrapperUrl}`);
    const reqRes = await fetch(wrapperUrl);

    console.log(`Status: ${reqRes.status} ${reqRes.statusText}`);
    if (reqRes.status === 402) {
        const body = await reqRes.json();
        console.log('402 Response Body:', body);
        console.log('WWW-Authenticate Header:', reqRes.headers.get('www-authenticate'));
        console.log('\nSUCCESS: 402 Payment Required enforced correctly.');
    } else {
        console.error('FAILED: Did not receive 402');
    }
}

runTest().catch(console.error);
