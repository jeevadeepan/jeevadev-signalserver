const fs = require('fs');
const https = require('https');
// const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

const express = require('express');
const cors = require('cors');
const jsonParser = bodyParser.json();


const app = express();
let clientId;
app.use(cors());


const admin = require("firebase-admin");

admin.initializeApp();


// create a route for the app
app.post('/register', jsonParser, (req, res) => {
  clientId = req.body.token;
  res.send('Token registered');
});

// another route
app.get('/connect', (req, res) => {
  const message={
    "token": clientId,
    "notification": {
      "title": "Jeeva dev user",
      "body": "Incoming call from Jeeva.dev user"
    },
    "webpush": {
      "fcm_options": {
        "link": "https://jeeva.dev/#/chat"
      }
    }
  };

  admin.messaging().send(message).then(response => {
  }).catch(error => {
    console.log('Error sending FCM message: ', error);
  })
  res.send('Hello!');
});

const server = https.createServer({
    cert: fs.readFileSync('/etc/letsencrypt/live/signal.jeeva.dev/cert.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/signal.jeeva.dev/privkey.pem')
});
// const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    console.log(data);
    wss.clients.forEach(function each(client) {
      if (client !== ws &&client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

server.listen(443);
// server.listen(3001);
