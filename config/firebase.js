const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://iot-bin-database-default-rtdb.firebaseio.com/',
  });
}

module.exports = admin.database();
