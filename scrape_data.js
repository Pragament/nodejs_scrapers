const puppeteer = require('puppeteer');
const fs = require('fs');
const autoScroll = require('./events');

const linuxUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36";

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage()

        let swiggyInstaData = [];
        const categoryData = [];
        let categoryID = 1;

        await page.setUserAgent(linuxUserAgent);

        await page.goto("https://www.swiggy.com/instamart", { waitUntil: 'networkidle2' })

        await page.mouse.click(10, 10);

        await page.waitForSelector(".rKVoK._1kbVF", { timeout: 60000 })

        const categories = await page.$$(".rKVoK._1kbVF > div > button")
        for (const category of categories) {

            const categoryName = await category.$eval(
                'div',
                el => el.innerText.trim()
            )

            console.log(categoryName);

            // const subCategoryData = await getSubCategories("Dairy%2C+Bread+and+Eggs", browser)
            const subCategoryData = await getSubCategories(categoryName, browser)

            categoryData.push({
                id: categoryID,
                name: categoryName,
                subcategories: subCategoryData
            })
            categoryID++;
        }


        swiggyInstaData = {
            categories: categoryData
        }
        // fs.writeFileSync('instamart_products.json', JSON.stringify(swiggyInstaData, null, 2))
    } catch (e) {
        console.log(e);
    }
})();

async function getSubCategories(category, browser) {
    const subCategoryPage = await browser.newPage();
    let subCategoryID = 1;
    const subCategoryData = [];

    await subCategoryPage.setUserAgent(linuxUserAgent);

    await subCategoryPage.goto(`https://www.swiggy.com/instamart/category-listing?categoryName=${category}&custom_back=true&taxonomyType=All+Listing`, { waitUntil: 'networkidle2' })

    await subCategoryPage.waitForSelector('ul', { timeout: 60000 });

    let subCategories = await subCategoryPage.$$("li");

    for (let i = 0; i < subCategories.length; i++) {
        // for (const subCategory of subCategories) {
        subCategories = await subCategoryPage.$$("li");
        const subCategory = subCategories[i]

        const subCategoriesName = await subCategory.$eval("div", el => el.innerText);
        // subCategoryData.push({
        //     id: subCategoryID,
        //     name: subCategoriesName
        // })
        await getProductDetails(subCategory, subCategoryPage, i);
        subCategoryID++;
    }
    await subCategoryPage.close();
    return subCategoryData;
}

let productID = 1;
async function getProductDetails(subCategory, page, index) {
    const productData = [];
    let manufacturerName;

    await subCategory.click();

    await page.waitForSelector('._2Wq_D', { timeout: 60000 });

    const productList = await page.$$('._2Wq_D');

    await autoScroll(page, productList[index]);

    // if (productList) {
    //     await page.evaluate(div => {
    //         // div.scrollBy(0, 1000);
    //         div.scrollTop += 1000;
    //         console.log(div.scrollTop);

    //     }, productList);
    // } else {
    //     console.log("Product list container not found.");
    // }

    await page.waitForSelector('[data-testid="ItemWidgetContainer"]', { timeout: 60000 });

    let products = await page.$$('[data-testid="ItemWidgetContainer"]');

    console.log("length = " + products.length);
    for (let i = 0; i < products.length; i++) {
        // for (const product of products) {

        // products = await page.$$('[data-testid="ItemWidgetContainer"]');
        // const product = products[i];

        // const productName = await product.$eval(".novMV", el => el.innerText);
        // const productBtn = await product.$('button');

        // productList.scrollBy(0, 100)

        // await productBtn.click();
        // console.log(productName);
        // try {
        //     await page.waitForSelector('[data-testid="brand-items-cta-container"]', { timeout: 1000 });

        //     const shopNameFull = await page.$eval('[data-testid="brand-items-cta-container"] > div', el => el.innerText).catch(() => "");
        //     manufacturerName = shopNameFull != "" ? shopNameFull.split("Explore all ")[1].split(" items")[0].trim() : "";

        //     console.log(manufacturerName);
        // } catch (e) { }

        // console.log(productID); // 221 fresh vegtables
        // productID++;

        // if (page.url().includes('https://www.swiggy.com/instamart/item/')) {
        //     await new Promise(r => setTimeout(r, 3000));
        //     const backBtn = await page.$('[data-testid="simpleheader-back"]');
        //     await backBtn.click();
        // }

        // console.log(productName);

        // const newUrl = page.url();

    }
}