const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()

var userList = [];
var exerciseList = [];
var userId = 1;

app.use(cors())
app.use(express.static('public'))
app.use(function middleware(req, res, next) {
  next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  console.log('Test /api/user get')
  return res.json( userList )
});

app.get('/api/users/:_id/logs', (req, res) => {
  console.log('Test /api/users/:_id/logs get')
  const searchId = req.params._id;
  let found = userList.find(e => e._id === searchId);
  if (found) {
    const dateFrom = req.query.from;
    const dateTo = req.query.to;
    const searchLimit = req.query.limit;
    let exeFound = exerciseList.find(e => e._id === searchId)
    if (dateFrom || dateTo || searchLimit) {
      console.log('Get query', exeFound );
      let logs = []
      exeFound.log.forEach(el => {
        logs.push(el);
      });
      console.log(logs)
      if (dateFrom) {
        logs = logs.filter((e) => new Date(e.date) >= new Date(dateFrom))
      }
      if (dateTo) {
        logs = logs.filter((e) => new Date(e.date) <= new Date(dateTo))
      }
      if (searchLimit) {
        while(logs.length > searchLimit) {
          logs.pop()
        }
      }
      console.log(dateFrom, dateTo, searchLimit)
      return res.json({
        'username': exeFound.username,
        'count': exeFound.count,
        '_id': searchId,
        'log': logs
      })
    } else {
      console.log( 'not query', exeFound );
      return res.json( exeFound );
    }
  } else {
    return res.json({ 'error': 'unable to found' })
  };
})

function generateUserId() {
  return userId++;
}

app.post('/api/users', (req, res) => {
  const username = req.body.username
  console.log('Test /api/users post', username, userId)
  const newUserObject = {
    '_id': userId.toString(),
    'username': username
  };
  userList.push(newUserObject);
  console.log('Add new user:', newUserObject);
  console.log('Current user list:', userList);
  generateUserId();
  return res.json({ '_id': (userId - 1).toString(), 'username': username })
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const searchId = req.params._id;
  console.log('Test /express.application.users/:_id/exercises post', searchId);
  let found = userList.find(e => e._id === searchId)
  console.log(searchId, found)
  console.log(req.body.date)
  let exeDate = req.body.date ? new Date(req.body.date).toDateString(): new Date().toDateString();
  console.log(exeDate, typeof(exeDate));
  if (found) {
    const newExeObject = {
      '_id': searchId,
      'username': found.username,
      'date': exeDate,
      'duration': parseInt(req.body.duration),
      'description': req.body.description
    }
    let exeFound = exerciseList.find(e => e._id === searchId)
    if (exeFound) {
      const objIndex = exerciseList.findIndex(e => e._id === searchId)
      exeFound.count += 1
      console.log('Existing log:', exeFound.log);

      exeFound.log.push({
        'description': req.body.description,
        'duration': parseInt(req.body.duration),
        'date': exeDate})
    } else {
      const newExeObjLog = {
        'username': found.username,
        'count': 1,
        '_id': searchId,
        'log': [{
          'description': req.body.description,
          'duration': parseInt(req.body.duration),
          'date': exeDate
        }]
      }
      exerciseList.push(newExeObjLog);  
    }
    console.log(exerciseList);
    return res.json( newExeObject );
  } else {
    return res.json({ 'error': 'unable to found' })
  };
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
