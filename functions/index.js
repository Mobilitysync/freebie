const functions = require('firebase-functions');
const express   = require('express');
const cors      = require('cors')({ origin: true });

const app = express();
app.use(cors);

const firebaseConfig = {
  apiKey:            functions.config().firebase_config.api_key,
  authDomain:        functions.config().firebase_config.auth_domain,
  projectId:         functions.config().firebase_config.project_id,
  storageBucket:     functions.config().firebase_config.storage_bucket,
  messagingSenderId: functions.config().firebase_config.messaging_sender_id,
  appId:             functions.config().firebase_config.app_id,
  measurementId:     functions.config().firebase_config.measurement_id
};

app.get('/config', (req, res) => {
  res.json(firebaseConfig);
});

exports.api = functions.https.onRequest(app);
