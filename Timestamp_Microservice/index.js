// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//res.json({unix: '', utc: ''});

app.get("/api/:date?", function(req, res) {
  date = req.params.date;
  console.log(date);
  if (/\d{5,}/.test(date)) {
    console.log("type = 'UNIX'")
    var dateInt = parseInt(date);
    res.json({unix: dateInt, utc: new Date(dateInt).toUTCString() });
  } else {
    console.log("type = 'UTC'")
    var dateObject = new Date(date);
      if (dateObject.toString() === "Invalid Date") {
        if (date === undefined) {
          let now = new Date();
          let nowUNIX = now.valueOf();
          let nowUTC = now.toUTCString();
          res.json({unix: nowUNIX, utc: nowUTC});
        } else {
          res.json({ error: "Invalid Date" });
        }
      } else {
        res.json({unix: dateObject.valueOf(), utc: dateObject.toUTCString() });
      }
  }
});


// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
