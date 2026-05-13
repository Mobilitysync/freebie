const functions = require('firebase-functions');
const express   = require('express');
const cors      = require('cors')({ origin: true });

const app = express();
app.use(cors);

app.get('/config', (req, res) => {
  res.json({
    apiKey:            process.env.API_KEY,
    authDomain:        process.env.AUTH_DOMAIN,
    projectId:         process.env.PROJECT_ID,
    storageBucket:     process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId:             process.env.APP_ID,
    measurementId:     process.env.MEASUREMENT_ID
  });
});

exports.api = functions.https.onRequest(app);
