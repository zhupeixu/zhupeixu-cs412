// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ps4 = require('./ps4');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/ps4', ps4);

app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});