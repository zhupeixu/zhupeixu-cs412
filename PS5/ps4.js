// ps4.js
const express = require('express');
const router = express.Router();
const request = require('request');
const { fetch } = import('node-fetch');
// const fetch = require('node-fetch');

const redis = require('redis');

const client = redis.createClient({
  host: '127.0.0.1',
  port: '6379',
  password: process.env.REDIS_PASSWORD
});

client.on('connect', () => {
  console.log('Connected to Redis server');
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
});
client.connect();
const Prefix = 'ps4:';

router.post('/promises', async (req, res) => {
  const word = req.body.word;
  console.log('word', word);
  const options = {
    method: 'GET',
    url: 'https://wordsapiv1.p.rapidapi.com/words/' + word + '/similarTo',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }
  };

  const reply = await client.get(Prefix + word);
  console.log('reply', reply);
  if (reply) {
    const data = JSON.parse(reply);
    return res.status(200).json({ data, fromCache: true });
  }

  request(options, (error, response, body) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const data = JSON.parse(body);
    console.log('body', data);
    client.setEx(Prefix + word, 15, JSON.stringify(data));
    return res.status(200).json({ data, fromCache: false });
  });
});

// router.post('/async-await', async (req, res) => {
//   const word = req.body.word;
//   const options = {
//     method: 'GET',
//     url: 'https://wordsapiv1.p.rapidapi.com/words/' + word + '/similarTo',
//     headers: {
//       'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
//       'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
//     }
//   };

//   try {
//     const response = await fetch(options.url, options);
//     const data = await response.json();
//     res.render('index', { data });
//   } catch (error) {
//     res.render('index', { error: error.message });
//   }
// });

router.post('/async-await', async (req, res) => {
  const word = req.body.word;
  const options = {
    method: 'GET',
    url: 'https://wordsapiv1.p.rapidapi.com/words/' + word + '/similarTo',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }
  };

  try {
    const body = await new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) reject(new Error(error));
        resolve(body);
      });
    });

    console.log('body', JSON.parse(body));
    res.render('index', { data: JSON.parse(body) });
  } catch (error) {
    res.render('index', { error: error.message });
  }
});




router.post('/callback', (req, res) => {
  const word = req.body.word;
  const options = {
    method: 'GET',
    url: 'https://wordsapiv1.p.rapidapi.com/words/' + word + '/similarTo',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }
  };

  request(options, (error, response, body) => {
    if (error) return res.render('index', { error: error.message });
    console.log('body', JSON.parse(body));
    res.render('index', { data: JSON.parse(body) });
  });
});

module.exports = router;