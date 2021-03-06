import express from 'express';
import morgan from 'morgan';
import request from 'request';
import path from 'path';
import dotenv from 'dotenv';

dotenv.load();

let app = express();

// Logging
app.use(morgan('combined'));

// Static files
app.use(express.static(path.resolve(path.resolve('.'), 'dist')));

// Route to get our token
app.get('/token', (req, res) => {
  if (!req.query.code && !req.query.grant_type) {
    return res.status(401).json({
      message: 'No authorisation code provided'
    });
  }

  request.post({
    url: 'https://api.getmondo.co.uk/oauth2/token',
    form: {
      grant_type: req.query.grant_type || 'authorization_code',
      client_id: process.env.MONZO_CLIENT_ID,
      client_secret: process.env.MONZO_CLIENT_SECRET,
      redirect_uri: process.env.MONZO_REDIRECT_URI,
      [req.query.grant_type === 'refresh_token' ? 'refresh_token' : 'code']:
        req.query.grant_type === 'refresh_token' ? req.query.refresh_token : req.query.code
    }
  }, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      res.status(200).json(JSON.parse(body));
    } else {
      res.status(response.statusCode).json({
        message: body
      });
    }
  });
});

// Send everything else to react-router
app.use('*', (req, res) => {
  res.sendFile(path.resolve('.', 'dist/index.html'));
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Monzoweb server running on port ${process.env.PORT || 8000}`);
});
