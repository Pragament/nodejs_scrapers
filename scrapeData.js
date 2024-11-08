const puppeteer = require('puppeteer');
const fs = require('fs');
const autoScroll = require('./events');

const linuxUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36";

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });

        console.log("Scraping Data....")

        const categoryData = await getCategoriesData(browser);
        await getProductsData(browser);

        console.log("Data Scraped Successfully....")
        // await browser.close();

        let swiggyInstamartData

        // console.log(categoryData.length);
        // swiggyInstamartData = {
        //     categories: categoryData
        // }
        // fs.writeFileSync('instamart_products.json', JSON.stringify(swiggyInstamartData, null, 2))

    } catch (e) {
        console.log(e);
    }
})()

let categoryList = [];
async function getCategoriesData(browser) {
    const page = await browser.newPage();
    await page.setUserAgent(linuxUserAgent);
    await page.goto("https://www.swiggy.com/instamart", { waitUntil: 'networkidle2' });

    return new Promise((resolve, reject) => {
        page.on('response', async (response) => {
            try {
                if (response.url().includes('https://www.swiggy.com/api/instamart/home?clientId=INSTAMART-APP')) {
                    const apiData = await response.json();

                    const categoryData = apiData["data"]["widgets"][1]["data"].map((val, index) => {
                        categoryList.push(val["displayName"])
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
}

async function getProductsData(browser) {
    try {
        const page = await browser.newPage();
        await page.setUserAgent(linuxUserAgent);

        for (const category of categoryList) {

            await page.goto(`https://www.swiggy.com/instamart/category-listing?categoryName=${category}&custom_back=true&taxonomyType=All+Listing`, { waitUntil: 'networkidle2' });

            await page.waitForSelector('ul', { timeout: 60000 });
            await page.waitForSelector('._2Wq_D', { timeout: 60000 });

            let subCategories = await page.$$("li");
            let isFirstOpen = false;

            for (let i = 1; i < subCategories.length; i++) {
                let dataIndex = 1;
                subCategories = await page.$$("li");
                const subCategory = subCategories[i]
                await subCategory.click();

                const productList = await page.$$('._2Wq_D');

                if (!isFirstOpen) {
                    isFirstOpen = true;
                    i = -1;
                } else {
                    await autoScroll(page, productList[i]);
                    // return new Promise((resolve, reject) => {
                    page.on('response', async (response) => {
                        // try {
                        if (response.url().includes('https://www.swiggy.com/api/instamart/category-listing/')) {

                            console.log(response.url())
                            const apiData = await response.json();
                            // for fresh fruits in fresh vegges ["data"]["widgets"][2]["data"]
                            apiData["data"]["widgets"][dataIndex]["data"].map(val => console.log(val["display_name"]))
                            // const categoryData = apiData["data"]["widgets"][1]["data"].map((val, index) => ({
                            //     id: index + 1,
                            //     name: val["displayName"],
                            //     subcategories: val["nodes"].map((data, index) => ({ id: index + 1, name: data["displayName"] }))
                            // }));

                            // await page.close();
                            // resolve(categoryData);
                            dataIndex = 0;
                        }
                        // } catch (error) {
                        //     reject(error);
                        // }
                    });
                    // })
                }
                // await new Promise(r => setTimeout(r, 3000));


                await new Promise(r => setTimeout(r, 3000));
                // })
            }
        }
    } catch (error) {
        console.log(error);
    }

}


// await page.waitForSelector('._2Wq_D', { timeout: 60000 });

// const productList = await page.$('._2Wq_D');
// autoScroll(page, productList)

// return new Promise((resolve, reject) => {
//     page.on('response', async (response) => {
//         try {
//             if (response.url().includes('https://www.swiggy.com/api/instamart/home?clientId=INSTAMART-APP')) {
//                 const apiData = await response.json();

//                 const categoryData = apiData["data"]["widgets"][1]["data"].map((val, index) => ({
//                     id: index + 1,
//                     name: val["displayName"],
//                     subcategories: val["nodes"].map((data, index) => ({ id: index + 1, name: data["displayName"] }))
//                 }));

//                 await page.close();
//                 resolve(categoryData);
//             }
//         } catch (error) {
//             reject(error);
//         }
//     });

//     page.reload().catch(reject);
// });
// }
