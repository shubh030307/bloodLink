async function testLogin() {
  try {
    const res = await fetch('https://bloodlink.shubhrojyotisaha.workers.dev/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_script_1787344965835@example.com',
        password: 'password123'
      })
    });

    const data = await res.text();
    console.log('Login Response:', res.status, data);
  } catch (error: any) {
    console.error('Error during test:', error.message);
  }
}

testLogin();
