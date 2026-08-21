import 'dotenv/config';

async function seedBloodBanks() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials');
    return;
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const bloodBanks = [
    {
      id: 'center-1',
      name: 'Central City Blood Bank',
      address: '123 Main St, City Center',
      capacity: 100
    },
    {
      id: 'center-2',
      name: 'Hope Regional Blood Center',
      address: '456 Hope Blvd, Westside',
      capacity: 150
    },
    {
      id: 'center-3',
      name: 'LifeGuard Blood Services',
      address: '789 Life Rd, North District',
      capacity: 80
    }
  ];

  try {
    for (const bank of bloodBanks) {
      console.log(`Upserting BloodBank: ${bank.name}`);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/BloodBank?id=eq.${bank.id}`, {
        method: 'GET',
        headers
      });
      const existing = await res.json();
      
      if (existing && existing.length > 0) {
        console.log(`Already exists. Updating...`);
        await fetch(`${SUPABASE_URL}/rest/v1/BloodBank?id=eq.${bank.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(bank)
        });
      } else {
        console.log(`Creating...`);
        const createRes = await fetch(`${SUPABASE_URL}/rest/v1/BloodBank`, {
          method: 'POST',
          headers,
          body: JSON.stringify(bank)
        });
        if (!createRes.ok) {
           console.error('Failed to create:', await createRes.text());
        }
      }
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const dateStr = today.toISOString();
    
    // Create a date slightly in the future so it can be booked
    const startTime1 = new Date();
    startTime1.setHours(startTime1.getHours() + 1);
    const endTime1 = new Date(startTime1);
    endTime1.setHours(endTime1.getHours() + 1);

    const startTime2 = new Date();
    startTime2.setHours(startTime2.getHours() + 2);
    const endTime2 = new Date(startTime2);
    endTime2.setHours(endTime2.getHours() + 1);

    const slots = [
      {
        id: 'slot-1',
        bloodBankId: 'center-1',
        date: dateStr,
        startTime: startTime1.toISOString(),
        endTime: endTime1.toISOString(),
        capacity: 10
      },
      {
        id: 'slot-2',
        bloodBankId: 'center-2',
        date: dateStr,
        startTime: startTime2.toISOString(),
        endTime: endTime2.toISOString(),
        capacity: 15
      }
    ];

    for (const slot of slots) {
      console.log(`Upserting DonationSlot: ${slot.id}`);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/DonationSlot?id=eq.${slot.id}`, {
        method: 'GET',
        headers
      });
      const existing = await res.json();
      
      if (existing && existing.length > 0) {
         await fetch(`${SUPABASE_URL}/rest/v1/DonationSlot?id=eq.${slot.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(slot)
        });
      } else {
        const createRes = await fetch(`${SUPABASE_URL}/rest/v1/DonationSlot`, {
          method: 'POST',
          headers,
          body: JSON.stringify(slot)
        });
        if (!createRes.ok) {
           console.error('Failed to create slot:', await createRes.text());
        }
      }
    }
    
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding:', error);
  }
}

seedBloodBanks();
