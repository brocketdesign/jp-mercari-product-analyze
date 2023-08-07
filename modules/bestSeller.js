const { ResumeToken } = require("mongodb");

async function bestSeller(db) {
    const today = getCurrentDate();
    const productCollection = db.collection(`products_${today}`);

    const products = await productCollection.find().toArray();
    console.log(`Purification of data (${products.length}) ... `);

    const uniqueUrls = new Set();
    const duplicateUrls = new Set();

    for (const product of products) {
        if (uniqueUrls.has(product.url)) {
            duplicateUrls.add(product.url);
        } else {
            uniqueUrls.add(product.url);
        }
    }

    for (const url of duplicateUrls) {
        await productCollection.deleteOne({ 'url': url });
    }

    console.log(`${products.length - duplicateUrls.size} ... Done`);

    const titles = [];
    const allProducts = await productCollection.find().sort({ '__date': -1 }).toArray();

    for (const product of allProducts) {
        const titleWords = product.title.split(" ");
        titles.push(...titleWords);
    }

    console.log(`Looking for Best Sellers ... ${today} ... ${allProducts.length} entries`);

    const wordCounts = {};
    const remove = ['', '専用', '/', ':', '★'];

    for (const word of titles) {
        if (!remove.includes(word)) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    }

    const sortedWords = Object.entries(wordCounts)
        .map(([word, count]) => ({ w: word, c: count, __date: today }))
        .sort((a, b) => b.c - a.c);

    await addResults(sortedWords, today, db);

    for (let i = 0; i < 10; i++) {
        console.log(sortedWords[i]);
    }

    console.log('Done !');
}

async function addResults(results, today, db) {
    const bestCollection = db.collection(`best_${today}`);

    for (let i = 0; i < 10; i++) {
        const wordData = results[i];
        const existingWord = await bestCollection.findOne({ w: wordData.w });

        if (existingWord) {
            await bestCollection.updateOne({ w: wordData.w }, { $set: wordData });
        } else {
            await bestCollection.insertOne(wordData);
        }
    }
}

function getCurrentDate() {
    const date = new Date();
    return `${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}`;
}

module.exports = bestSeller;
