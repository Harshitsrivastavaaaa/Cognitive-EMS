const db = require('./db');
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('HRMS Backend API is live!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});0