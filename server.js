const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cronJobs = require('./modules/cronJobs')
const MongoClient = require('mongodb').MongoClient;
var routes = require('./routes/app');
var api = require('./routes/api');

app.use(express.static('public'));  
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.use('/', routes);
app.use('/api', api);

MongoClient.connect(process.env.MONGODB_URL)
.then(client =>{
  const db = client.db('mercari');
  app.locals.db = db;
  cronJobs(db)
});

app.use((req, res,next) => {
  res.status(404).render('404')
});

const server = app.listen(3100, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});