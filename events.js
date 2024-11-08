async function autoScroll(page, productList) {
    if (productList) {
        await page.evaluate(async div => {
            let previousHeight = 0;
            let scrollAttempts = 0;

            while (scrollAttempts < 20) {
                previousHeight = div.scrollHeight;
                div.scrollTop = div.scrollHeight;

                await new Promise(resolve => setTimeout(resolve, 3000));

                console.log(`pre height = ${previousHeight} | scroll height = ${div.scrollHeight} || ${div.scrollHeight === previousHeight}`);

                if (div.scrollHeight === previousHeight) {
                    console.log(`break | ${div.scrollHeight} === ${previousHeight}`);

                    break;
                }

                scrollAttempts++;
            }
        }, productList);
    }
}

module.exports = autoScroll
