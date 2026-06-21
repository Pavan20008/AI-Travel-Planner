const fetch = global.fetch || require('node-fetch');

(async () => {
  try {
    const health = await fetch('http://localhost:5000/api/health');
    console.log('HEALTH', health.status, await health.json());

    const trips = await fetch('http://localhost:5000/api/trips');
    console.log('TRIPS', trips.status, await trips.text());

    const testEmail = `testuser+ai+${Date.now()}@example.com`;
    const register = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test1234', name: 'Test User' }),
    });
    console.log('REGISTER', register.status, await register.text());

    const login = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'test1234' }),
    });
    const loginBody = await login.json();
    console.log('LOGIN', login.status, loginBody);

    if (loginBody.token) {
      const tripResp = await fetch('http://localhost:5000/api/trips/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${loginBody.token}`,
        },
        body: JSON.stringify({
          destination: 'Paris, France',
          durationDays: 3,
          budgetTier: 'Medium',
          interests: ['Food & Dining', 'History & Culture'],
        }),
      });
      console.log('GENERATE_TRIP', tripResp.status, await tripResp.text());

      const tripsAuth = await fetch('http://localhost:5000/api/trips', {
        headers: { Authorization: `Bearer ${loginBody.token}` },
      });
      console.log('TRIPS_AUTH', tripsAuth.status, await tripsAuth.text());
    }
  } catch (err) {
    console.error(err);
  }
})();