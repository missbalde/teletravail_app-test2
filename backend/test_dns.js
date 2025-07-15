require('dns').lookup('db.xpiaaxgdieakygrkqjnt.supabase.co', (err, address, family) => {
    if (err) {
      console.error('DNS lookup error:', err);
    } else {
      console.log('DNS address:', address, 'family:', family);
    }
  });