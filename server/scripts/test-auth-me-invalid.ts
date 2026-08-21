async function testAuthMeInvalid() {
  try {
    const res = await fetch('https://bloodlink.shubhrojyotisaha.workers.dev/api/auth/me', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_token'
      }
    });

    const data = await res.text();
    console.log('Auth Me Invalid Response:', res.status, data);
  } catch (error: any) {
    console.error('Error during test:', error.message);
  }
}

testAuthMeInvalid();
