// Test du fuseau horaire
const moment = require('moment-timezone');

console.log('=== TEST FUSEAU HORAIRE ===');
console.log('Date UTC:', new Date().toISOString());
console.log('Date locale (moment):', moment().tz('Europe/Paris').format('YYYY-MM-DD HH:mm:ss'));
console.log('Date locale (JS):', new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }));
console.log('=========================='); 