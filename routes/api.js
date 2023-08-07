var express = require('express');
var router = express.Router();
const fs = require('fs');

const ObjectId = require('mongodb').ObjectId;

require('dotenv').config({ path: './.env' });

const cookieParser = require('cookie-parser');
router.use(cookieParser('twa'));

const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false })  

router.post('/viewdata',urlencodedParser,async (req, res) => {
  res.redirect('/viewdata?dataBaseId='+req.body.dataBaseId)
});
router.post('/csv/viewdata',urlencodedParser,async (req, res) => {
  const db = req.app.locals.db;
  const fs = require('fs');
  const converter = require('json-2-csv');
  let myCollection = db.collection(req.body.dataBaseId)
  myCollection.find().toArray((err, results) => { 
    new Promise((resolve,reject) => {
      converter.json2csv(results, (err, csv) => {
          if (err) { throw err; reject()}
          fs.writeFile(req.body.dataBaseId+'.csv',csv,function(err,res){
            if(err){console.log(err)}
          })
        })
      });
     })
     res.send('./')
  });
  router.get('/userid',urlencodedParser, (req, res) => {
    const db = req.app.locals.db;
    var date = new Date();
    var today = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
    let isLogin = req.signedCookies.isLogin
    if( isLogin != undefined){
      if( isLogin.statut == true ){
        let userID = isLogin.userID
        let myCollection = db.collection('users')
        myCollection.findOne({'_id':new ObjectId(userID)}, (err, user) => {
          res.send(user._id)
        })
      }
    }
  });
//CONTROL DB
router.post('/:myAction/:elementType',urlencodedParser,async (req, res) => {
  const db = req.app.locals.db;
  let myAction = req.params.myAction
  let elementType = req.params.elementType
  var date = new Date();
  var today = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
  console.log({
    action:myAction,
    elementType:elementType,
    elementTypeID:req.query.elementTypeID,
  })
  if( myAction == 'editAll'){
    let myCollection = db.collection(elementType)
    await new Promise((resolve,reject)=>{
      myCollection.remove({},()=>{
        resolve()
      })
    })
    let data = []
    try{
      req.body.el.forEach(element => {
        data.push({el:element})
      });
    }catch{
      data.push(req.body)
    }
    await new Promise((resolve,reject)=>{
      myCollection.insertMany(data, (err, results) => { 
        resolve()
      });
    })
  }//editAll

  if( myAction == 'addone'){
    let myCollection = db.collection(elementType)
    await new Promise((resolve,reject)=>{
      myCollection.insertOne(req.body, (err, result) => { resolve() });
    })
  }//ADD ONE

  if( myAction == 'edit'){
    if(req.query.elementTypeID){
      let myCollection = db.collection(elementType)
      await new Promise((resolve,reject)=>{
        myCollection.updateOne({ '_id': new ObjectId(req.query.elementTypeID) }, { $set: req.body }, (err, result) => { 
          resolve()
         });
      })
    }else{
      console.log('elementTypeID not founded')
    }
  };
  if( myAction == 'delete'){
    if(req.query.elementTypeID){
      let myCollection = db.collection(elementType)
      await new Promise((resolve,reject)=>{
        myCollection.deleteOne({ '_id': new ObjectId(req.query.elementTypeID) }, (err, result) => { 
          resolve()
         });
      })
    }else{
      console.log('elementTypeID not founded')
    }
  }
  res.redirect('back')
});
//GET DATA FROM DB
router.get('/db/:dbName',urlencodedParser, (req, res) => {
  const db = req.app.locals.db;
  let dbName = req.params.dbName
  let elID = req.query.elID
  if(elID){
    db.collection(dbName).findOne({'_id':new ObjectId(elID)}, (err, result) => {res.send(result);})
  }else{
    db.collection(dbName).find().sort({'_id':-1}).toArray((err, results) => { 
      res.send(results);
    });
  }
});

//ADD DATA TO DB FRON JSON
router.get('/',urlencodedParser, (req, res) => {
  const db = req.app.locals.db;
/*
  const data = require('./list/工事名.json')
  db.collection('genba').insertMany(data, (err, results) => {
    db.collection('genba').find().toArray((err, results) => { res.send(results) });
   });
*/
  res.send('api v1.00');

  //UPDATE DATABASE
  /*
    koushuFile.forEach(koushu => {
        let fileEl = koushu.el
        let fileName = koushu.name
        
        db.collection('koushu').updateOne({ 'el': fileEl }, { $set: { 
          '業者名': fileName
        } },(err, result) => {  });
        
      });
      res.send('DONE');
  */
  //DELETE DUPLICATE
  /*
    db.collection('koushu').find().toArray((err, results) => { 
      let count = []
      results.forEach(element => {
        if( count.includes(element.el) == false ){
          count.push(element.el)
        }else{
          db.collection('koushu').deleteOne({ 'el': element.el }, (err, result) => { });
        }
      });
      res.send(JSON.stringify(count));
    });
  */

});
//DB UTILIZATION
function HowToUseMongoDB (){
  const db = req.app.locals.db;

  let myCollection = db.collection('meigara')

  //Find all documents
  myCollection.find().toArray((err, results) => { console.log(results); });
  //Find a document
  myCollection.find({'コード':code}).sort({'コード':1}).toArray(function(err, meigara) {})
  myCollection.findOne({'コード':code}, (err, meigara) => {})
  //Insert data to a collection
  myCollection.insertOne({ name: 'Web Security' }, (err, result) => { });
  myCollection.insertMany([
    { name: 'Web Design' },
    { name: 'Distributed Database' },
    { name: 'Artificial Intelligence' }
  ], (err, results) => { });
  //Update an existing document
  myCollection.updateOne({ name: 'Web Design' }, { $set: { name: 'Web Analytics' } }, (err, result) => {  console.log(result);  });
  //Delete a document
  myCollection.deleteOne({ name: 'Distributed Database' }, (err, result) => { console.log(result); });
}


module.exports = router;
