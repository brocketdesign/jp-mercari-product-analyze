var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

const bestSeller = require('../modules/bestSeller');
const scraper = require('../modules/scraper');

require('dotenv').config({ path: './.env' });

const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false })  
const date = new Date();
const today = (date.getMonth() + 1) +'_'+ date.getDate() +'_'+  date.getFullYear();

router.get('/',urlencodedParser, async (req, res) => {
  const db = req.app.locals.db;
  var ctoday = (date.getMonth() + 1) +'/'+ date.getDate() +'/'+  date.getFullYear();

  let myResult = await db.collection('results_'+today).find().sort({'__date':-1}).toArray()

  res.render('index',{title:'Mercari Market',datas:myResult,today:ctoday});
});

router.get('/products', urlencodedParser, async (req, res) => {
  try {
      const db = req.app.locals.db;
      const currentDate = getCurrentDate();
      const productCollection = db.collection(`products_${currentDate}`);
      const products = await productCollection.find().sort({ '__date': -1 }).toArray();

      const filteredProducts = products.filter(product => product !== undefined).map(product => {
          delete product._id;
          return product;
      });
      res.render('products', { title: 'Mercari Market', data: filteredProducts });
  } catch (err) {
      // Handle the error appropriately
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/result', urlencodedParser, async (req, res) => {
  try {
      const db = req.app.locals.db;
      let today = req.body.today || getCurrentDate(); // Assuming you have a function to get the current date

      const resultCollection = db.collection(`results_${today}`);
      const results = await resultCollection.find().sort({ '__date': -1 }).toArray();

      res.send(results);
  } catch (err) {
      // Handle the error appropriately
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/keyword/:keyword', urlencodedParser, async (req, res) => {
  const keyword = req.params.keyword;
  const data = await fetchKeywordData(keyword, req.app.locals.db);

  if (data.length === 0) {
      res.status(404).render('404');
  } else {
      const { total, sales, avg } = calculateStatistics(data);
      res.render('best', { title: keyword, today: getCurrentDate(), total, sales, avg, datas: data });
  }
});

router.post('/keyword/', urlencodedParser, async (req, res) => {
  const keyword = req.body.keyword;
  const data = await fetchKeywordData(keyword, req.app.locals.db);

  if (data.length === 0) {
      res.send(undefined);
  } else {
      const { sales } = calculateStatistics(data);
      res.send(sales);
  }
});

async function fetchKeywordData(keyword, db) {
  const today = getCurrentDate();
  const productCollection = db.collection(`products_${today}`);
  const allProducts = await productCollection.find().toArray();

  return allProducts.filter(product => product && product.title.includes(keyword));
}

function calculateStatistics(data) {
  const totalSales = data.reduce((acc, product) => acc + parseInt(product.price, 10), 0);
  const avgSales = totalSales / data.length;

  return {
      total: formatNumber(data.length),
      sales: formatNumber(totalSales),
      avg: formatNumber(avgSales)
  };
}

function getCurrentDate() {
  const date = new Date();
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


router.get('/best', urlencodedParser, async (req, res) => {
    const db = req.app.locals.db;
    const today = getCurrentDate();
    const bestCollection = db.collection(`best_${today}`);

    try {
        const results = await bestCollection.find().sort({ 'c': -1 }).toArray();
        res.render('best', { title: '売れ筋ランキング', datas: results, today: today });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/refresh', urlencodedParser, async (req, res) => {
    const db = req.app.locals.db;
    try {
        await scraper(db);
        await bestSeller(db);
        res.redirect('back');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Utility functions
function getCurrentDate() {
  const date = new Date();
  return `${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}`;
}

function getCurrentTime() {
  const date = new Date();
  return `${date.getHours()}:${date.getMinutes()}`;
}

// MongoDB utility functions
function useMongoDB(db) {
    const meigaraCollection = db.collection('meigara');

    // Find all documents
    meigaraCollection.find().toArray((err, results) => console.log(results));

    // Find a document
    const code = "YOUR_CODE_HERE"; // Replace with your code value
    meigaraCollection.find({ 'コード': code }).sort({ 'コード': 1 }).toArray();
    meigaraCollection.findOne({ 'コード': code });

    // Insert data to a collection
    meigaraCollection.insertOne({ name: 'Web Security' });
    meigaraCollection.insertMany([
        { name: 'Web Design' },
        { name: 'Distributed Database' },
        { name: 'Artificial Intelligence' }
    ]);

    // Update an existing document
    meigaraCollection.updateOne({ name: 'Web Design' }, { $set: { name: 'Web Analytics' } });

    // Delete a document
    meigaraCollection.deleteOne({ name: 'Distributed Database' });
}




module.exports = router;
