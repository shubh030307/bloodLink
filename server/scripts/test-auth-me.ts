async function testAuthMe() {
  try {
    const res = await fetch('https://bloodlink.shubhrojyotisaha.workers.dev/api/auth/me', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjODdmYmQyOC1jOGIxLTRlYTktOWZjMS1iYmU5ZjI5ZTU4MTUiLCJyb2xlIjoiRG9ub3IiLCJpYXQiOjE3ODczNDUwMzYsImV4cCI6MTc4NzQzMTQzNn0.amc_0PGvTXehdXxGaZw5x0qO_vKWezOzhgHvM4w_O9Y'
      }
    });

    const data = await res.text();
    console.log('Auth Me Response:', res.status, data);
  } catch (error: any) {
    console.error('Error during test:', error.message);
  }
}

testAuthMe();
