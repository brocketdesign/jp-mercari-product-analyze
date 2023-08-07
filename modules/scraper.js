const fs = require('fs');
const converter = require('json-2-csv');
const cheerio = require('cheerio');
const got = require('got');
const PostArticle = require('./post');
const puppeteer = require('puppeteer');

// Main scraper function
async function scrapeMercariData(db) {
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();

    console.log(`Collecting fresh DATA from Mercari on ${currentDate} at ${currentTime}`);
    const scrapedData = await fetchSearchResults(db);
    console.log(`Added ${scrapedData.length} entries to collection`);
    console.log('Updating result collection');

    const productCollection = db.collection(`products_${currentDate}`);
    const results = await productCollection.find().toArray();

    const totalSales = results.reduce((acc, product) => acc + parseInt(product.price), 0);
    const averageSales = formatNumber(totalSales / results.length);
    const formattedTotalSales = formatNumber(totalSales);
    const formattedTotalProducts = formatNumber(results.length);
    
    const summary = {
        date: new Date(),
        currentDate: currentDate,
        totalProducts: formattedTotalProducts,
        totalSales: formattedTotalSales,
        averageSales: averageSales
    };
    
    console.log(summary);
    
    const resultsCollection = db.collection(`results_${currentDate}`);
    await resultsCollection.insertOne(summary);
    

    //await fetchSingleProductDetails(scrapedData, db);
    //await delay(60000);

    console.log(`END: ${getCurrentDate()} at ${getCurrentTime()}`);
}

// Fetch search results from Mercari
async function fetchSearchResults(db) {
    const MERCARI_URL = 'https://jp.mercari.com/search?status=on_sale&category_root=&brand_name=&brand_id=&size_group=&price_min=&price_max=&status_trading_sold_out=1&page=1';
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    const currentDate = getCurrentDate();

    await page.goto(MERCARI_URL);
    await page.waitForSelector('.merItemThumbnail').catch(async () => {
        await browser.close();
        return [];
    });

    const body = await page.evaluate(() => document.querySelector('html').innerHTML);
    const $ = cheerio.load(body);
    const products = [];

    try {
        $('#item-grid ul li').each((index, element) => {
            if ($(element).find('.merItemThumbnail').attr('aria-label')) {
                products.push({
                    title: $(element).find('.merItemThumbnail').attr('aria-label'),
                    price: extractNumberFromPrice($(element).find('.merPrice').text()),
                    url: 'https://jp.mercari.com' + $(element).find('a').attr('href'),
                    img: $(element).find('.merItemThumbnail').find('img').attr('src'),
                    date: currentDate
                });
            }
        });
    } catch (error) {
        console.log(error);
    }

    await browser.close();

    const productCollection = db.collection(`products_${currentDate}`);
    
    const newProducts = [];
    for (const product of products) {
        //console.log(`Checking product with URL: ${product.url}`);
        
        const existingProduct = await productCollection.findOne({ url: product.url });
        
        if (!existingProduct) {
            //console.log(`Product with URL: ${product.url} does not exist. Adding to the database.`);
            
            newProducts.push(product);
            await productCollection.insertOne(product);
            
           // console.log(`Product with URL: ${product.url} added successfully.`);
        } else {
            //console.log(`Product with URL: ${product.url} already exists. Skipping.`);
        }
    }
    

    return newProducts;
}

// Fetch details of individual products
async function fetchSingleProductDetails(products, db) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    for (const product of products) {
        await page.goto(product.url);
        await page.waitForSelector('.slick-list').catch(() => false);

        const body = await page.evaluate(() => document.querySelector('html').innerHTML);
        const $ = cheerio.load(body);

        try {
            if ($('article').find('mer-heading').attr('title-label')) {
                const productDetails = {
                    title: $('article').find('mer-heading').find('h1').text(),
                    price: extractNumberFromPrice($('article').find('data-testid=["price"]').text()),
                    description: $('article').find('[data-testid="description"]').text(),
                    url: product.url,
                    imgs: [],
                    date: getCurrentDate()
                };

                $('article').find('.merItemThumbnail').each((index, element) => {
                    productDetails.imgs.push($(element).find('img').attr('src'));
                });

                //convertToArticleAndPost(productDetails);
            }
        } catch (error) {
            console.error(error);
            await browser.close();
        }
    }

    await browser.close();
}

// Convert product details to article format and post
async function convertToArticleAndPost(productDetails) {
    let content = '<item-infos ';
    for (const key in productDetails) {
        content += `data-${key}="${productDetails[key]}" `;
    }
    content += '>';
    content += '<div class="item-content">';
    content += `<h1>${productDetails.title}</h1>`;
    productDetails.imgs.forEach((img, index) => {
        content += `<img class="img-${index}" src="${img}" alt="${productDetails.title}">`;
        content += `<p class="source">引用元：${productDetails.url}</p>`;
    });
    content += `<p>${productDetails.price}</p>`;
    content += `<p>${productDetails.description}</p>`;
    content += `<p class="source">引用元：${productDetails.url}</p>`;
    content += '</div>';

    postArticle(productDetails, content);
}

// Post the article
async function postArticle(productDetails, content) {
    const options = {
        url: '',
        username: "",
        password: ''
    };

    try {
        await PostArticle(productDetails.title, content, options);
        console.log(productDetails.title.substring(0, 20));
    } catch (error) {
        console.error('Error with PostArticle:', error);
    }
}

// Utility functions
function getCurrentDate() {
    const date = new Date();
    return `${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}`;
}

function getCurrentTime() {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}`;
}

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function extractNumberFromPrice(priceString) {
    // Remove non-digit characters and parse the result as an integer
    return parseInt(priceString.replace(/[^0-9]/g, ""), 10);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = scrapeMercariData;
