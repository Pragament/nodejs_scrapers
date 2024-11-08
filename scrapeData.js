const autoScroll = require('./events');

const linuxUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36";

let categoryData = [];
async function getCategoriesData(browser) {
    try {
        const page = await browser.newPage();
        await page.setUserAgent(linuxUserAgent);
        await page.goto("https://www.swiggy.com/instamart", { waitUntil: 'networkidle2' });

        return new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                try {
                    if (response.url().includes('https://www.swiggy.com/api/instamart/home?clientId=INSTAMART-APP')) {
                        const apiData = await response.json();

                        categoryData = apiData["data"]["widgets"][1]["data"].map((val, index) => {
                            return ({
                                id: index + 1,
                                name: val["displayName"],
                                subcategories: val["nodes"].map((data, index) => ({ id: index + 1, name: data["displayName"] }))
                            })
                        });

                        await page.close();
                        resolve(categoryData);
                    }
                } catch (error) {
                    reject(error);
                }
            });

            page.reload().catch(reject);
        });
    } catch (error) {
        console.log(error)
    }
}

async function getProductsData(browser) {
    try {
        const page = await browser.newPage();
        await page.setUserAgent(linuxUserAgent);
        let productData = [];
        const fetchedCategories = new Set();
        let productID = 1;
        let subCategoryID;
        let subCategories = await page.$$("li");
        let isFirstOpen = false;

        const handlePageApiResponse = async (response) => {
            if (response.url().includes('https://www.swiggy.com/api/instamart/category-listing/')) {
                try {
                    if (isFirstOpen) {
                        const apiData = await response.json();
                        if (!fetchedCategories.has(apiData["data"]["filterName"])) {
                            if (apiData["data"]["totalItems"] != 0) {
                                const dataIndex = apiData["data"]["widgets"].length - 1;

                                apiData["data"]["widgets"][dataIndex]["data"].map(val => {
                                    productData.push({
                                        id: productID,
                                        name: val["display_name"],
                                        product_url: `https://www.swiggy.com/instamart/item/${val["product_id"]}`,
                                        image_url: `https://instamart-media-assets.swiggy.com/swiggy/image/upload/${val["variations"][0]["images"][0]}`,
                                        price: val["variations"][0]["price"].offer_price,
                                        measurement: {
                                            value: val["variations"][0]["quantity"],
                                            unit: val["variations"][0]["unit_of_measure"]
                                        },
                                        manufacturer: val["variations"][0]["brand"],
                                        subcategory_id: subCategoryID,
                                    })
                                    productID++;
                                }
                                )
                            }
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }

        page.on('response', handlePageApiResponse);

        for (const category of categoryData) {

            await page.goto(`https://www.swiggy.com/instamart/category-listing?categoryName=${category.name}&custom_back=true&taxonomyType=All+Listing`, { waitUntil: 'networkidle2' });

            await page.waitForSelector('ul', { timeout: 60000 });

            subCategories = await page.$$("li");
            isFirstOpen = false;
            subCategoryID = 0;

            for (let i = 1; i < subCategories.length; i++) {
                subCategories = await page.$$("li");
                const subCategory = subCategories[i]
                await subCategory.click();
                subCategoryID++;

                if (!isFirstOpen) {
                    await new Promise(r => setTimeout(r, 1000));
                    isFirstOpen = true;
                    i = -1;
                } else {
                    await page.waitForSelector('._2Wq_D', { timeout: 60000 });
                    const productList = await page.$$('._2Wq_D');

                    await autoScroll(page, productList[i]);

                    await new Promise(r => setTimeout(r, 2000));
                    fetchedCategories.add(category.subcategories[i].name);
                }
            }
        }
        return productData
    } catch (error) {
        console.log(error);
    }

}

module.exports = { getCategoriesData, getProductsData }