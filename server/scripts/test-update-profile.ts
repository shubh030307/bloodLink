async function testUpdateProfile() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjODdmYmQyOC1jOGIxLTRlYTktOWZjMS1iYmU5ZjI5ZTU4MTUiLCJyb2xlIjoiRG9ub3IiLCJpYXQiOjE3ODczNDUwMzYsImV4cCI6MTc4NzQzMTQzNn0.amc_0PGvTXehdXxGaZw5x0qO_vKWezOzhgHvM4w_O9Y';
    const res = await fetch('https://bloodlink.shubhrojyotisaha.workers.dev/api/donors/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        mobileNumber: '1231231234',
        address: 'New Updated Address',
        age: '30',
        gender: 'Male',
        emergencyContactName: 'New Emg Contact',
        emergencyContactRelationship: 'Brother',
        emergencyContactNumber: '0987654321'
      })
    });

    const data = await res.text();
    console.log('Update Profile Response:', res.status, data);

    const getRes = await fetch('https://bloodlink.shubhrojyotisaha.workers.dev/api/donors/profile', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Get Profile Response:', getRes.status, await getRes.text());
  } catch (error: any) {
    console.error('Error during test:', error.message);
  }
}

testUpdateProfile();
