async function testRegistration() {
  try {
    const res = await fetch('https://bloodlink.shubhrojyotisaha.workers.dev/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Registration Script',
        email: `test_script_${Date.now()}@example.com`,
        password: 'password123',
        roleName: 'Donor',
        age: '25',
        gender: 'Male',
        bloodGroup: 'B+',
        mobileNumber: '9998887777',
        address: 'Test Script Address',
        emergencyContact: {
          name: 'Emergency Test',
          relationship: 'Friend',
          mobileNumber: '1112223333'
        }
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));

    console.log('Registration successful!');
    console.log('Token:', data.token);

    // Now fetch profile
    const profileRes = await fetch('https://bloodlink.shubhrojyotisaha.workers.dev/api/donors/profile', {
      headers: { Authorization: `Bearer ${data.token}` }
    });

    const profileData = await profileRes.json();
    console.log('Profile data:', JSON.stringify(profileData, null, 2));

  } catch (error: any) {
    console.error('Error during test:', error.message);
  }
}

testRegistration();
