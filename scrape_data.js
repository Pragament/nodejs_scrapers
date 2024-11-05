const puppeteer = require('puppeteer');
const fs = require('fs');
const { log } = require('console');


(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage()

        let swiggyInstaData = [];
        const categoryData = [];
        let categoryID = 1;

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
        fs.writeFileSync('instamart_products.json', JSON.stringify(swiggyInstaData, null, 2))
    } catch (e) {
        console.log(e);
    }
})();

async function getSubCategories(category, browser) {
    const subCategoryPage = await browser.newPage();
    let subCategoryID = 1;
    const subCategoryData = [];
    await subCategoryPage.goto(`https://www.swiggy.com/instamart/category-listing?categoryName=${category}&custom_back=true&taxonomyType=All+Listing`, { waitUntil: 'networkidle2' })

    await subCategoryPage.waitForSelector('ul', { timeout: 60000 });

    const subCategories = await subCategoryPage.$$("li");

    for (const subCategory of subCategories) {
        const subCategoriesName = await subCategory.$eval("div", el => el.innerText);
        subCategoryData.push({
            id: subCategoryID,
            name: subCategoriesName
        })
        subCategoryID++;
    }
    await subCategoryPage.close();
    return subCategoryData;
}