const puppeteer = require('puppeteer');
const fs = require('fs');
const { getCategoriesData, getProductsData } = require('./scrapeData');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: "new", args: ['--disable-features=FirstPartySets'], });

        console.log("Scraping Data....")

        const categoryData = await getCategoriesData(browser);
        const productData = await getProductsData(browser);

        console.log("Data Scraped Successfully....")
        await browser.close();

        let swiggyInstamartData

        swiggyInstamartData = {
            categories: categoryData,
            products: productData
        }
        fs.writeFileSync('instamart_products.json', JSON.stringify(swiggyInstamartData, null, 2))

    } catch (e) {
        console.log(e);
    }
})()