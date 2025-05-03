require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = db;