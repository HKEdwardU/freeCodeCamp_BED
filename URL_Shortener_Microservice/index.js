require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const dns = require('dns');
const { URL } = require('url');

var arrayOfUrl = [];
let shortUrlCounter = 1;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(function middleware(req, res, next) {
  next();
})

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl', function(req, res) {
  res.json({ original_url: '', short_url: ''})
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrlString = req.params.short_url;
  const shortUrl = parseInt(shortUrlString, 10);

  console.log('Incoming Request: shortUrl=', shortUrlString, 'parsed=', shortUrl); // Log the incoming values

  if (isNaN(shortUrl)) {
    console.log('false - invalid short url');
    return res.status(400).json({ error: 'invalid short url' });
  }

  let found = arrayOfUrl.find(e => e.shortUrl === shortUrl);
  console.log('Found URL:', found, shortUrl, typeof shortUrl);

  if (found) {
    console.log(`Redirecting to: ${found.Url}`);
    let urlToRedirect = found.Url.startsWith('http') ? found.Url : `https://${found.Url}`;
    return res.redirect(urlToRedirect);
  } else {
    console.log('Short URL not found');
    return res.status(404).json({ error: 'Short URL not found' });
  }
});

function generateShortUrl() {
  return shortUrlCounter++;
}

app.post('/api/shorturl', (req, res) => {
  console.log('get post request:', req.method + " " + req.path + " - " + req.ip)

  const urlToShorten = req.body.url;

  console.log('url entered:', req.body.url);

  let hostname;

  try {
    const parsedUrl = new URL(urlToShorten);
    hostname = parsedUrl.hostname;
  } catch (err) {
    console.log('error: 1')
    return res.json({ 'error': 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      console.log('error: 2')
      return res.json({ 'error': 'invalid url' }); // DNS error
    }

    let found = arrayOfUrl.find(e => e.Url === req.body.url)
    console.log(req.body, found)
    if (found) {
      res.json({ original_url: found.Url, short_url: found.shortUrl})
    } else {
      const newShortUrl = generateShortUrl();
      const newUrlObject = {
        Url: urlToShorten,
        shortUrl: newShortUrl
      };

      arrayOfUrl.push(newUrlObject);
      console.log(arrayOfUrl);

      res.json({ original_url: urlToShorten, short_url: newShortUrl})
  }});
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
