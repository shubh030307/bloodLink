async function testGetCamps() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjODdmYmQyOC1jOGIxLTRlYTktOWZjMS1iYmU5ZjI5ZTU4MTUiLCJyb2xlIjoiRG9ub3IiLCJpYXQiOjE3ODczNDUwMzYsImV4cCI6MTc4NzQzMTQzNn0.amc_0PGvTXehdXxGaZw5x0qO_vKWezOzhgHvM4w_O9Y';
  try {
    const res = await fetch('https://bloodlink.shubhrojyotisaha.workers.dev/api/appointments/blood-banks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(res.status, await res.text());
  } catch (error) {
    console.error(error);
  }
}
testGetCamps();
