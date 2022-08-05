const puppeteer = require('puppeteer')

module.exports = async function start(request) {

    const browser = await puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disabled-setupid-sandbox'
        ],
        headless: false
    });

    const page = await browser.newPage();
    console.log("Browser Aberto")
    await page.goto(request.url)

    for (let params of request.elements) {
        let keys = Object.keys(params)
        for (let key of keys) {

            //key chave do element
            //value params[elements]

            await toFrom(key, page, params[key])
            if(params[key]["sleep"]["use"]){
                await sleep(params[key]["sleep"]["timer"])
            }
        }
    }

    await sleep(20000)

    await page.close()
    await browser.close()

    console.log("Browser fechado")
}

async function toFrom(key, page, params) {

    console.log(key)

    const tags = {
        "input": async () => {
            const element = await page.$x(params.xpath);
            await element[0].type(params.value);
        },
        "button": async () => {
            await page.keyboard.press(String.fromCharCode(13));
        },
        "click": async () => {
            await page.click(params.xpath)
        },
        "screenshot": async () => {
            await page.screenshot({
                path:`./${params.file}.${params.ext}`,
                clip: {
                    x: params.x,
                    y: params.y,
                    width: params.width,
                    height: params.height
                }
            });
        }
    }

    return tags[key]()

}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}