const {
    openBrowser,
    goto,
    write,
    click,
    press,
    closeBrowser,
    screenshot,
    reload,
    setConfig,
    highlight,
    into,
    $
} = require('taiko');

//Cache
const Cache = require("./Cache")
const cache = new Cache("cache.json")

//Log
const Log = require("./Log")
const log = new Log()

//Pdf
const Pdf = require('./Pdf')

module.exports = async function main(request, id) {
    try {

        let params = getParams(request.body)
        let url = getUrl(params[0])
        
        await setConfig( { observeTime: 60000 })

        const pdf = new Pdf(id, JSON.stringify(request.headers))

        log.info("Abrindo browser...")
        await openBrowser({ headless: false })
        log.info("Abrindo nova aba...")
        await goto(url)
        await execute(params, id)
        log.info("Gerando pdf...")
        pdf.createPdf()
        log.info("Atualizando cache...")
        cache.updateCache(id, "Closed")

    } catch (error) {
        log.info(`Erro ao abrir o browser: ${error}`)
    } finally {
        log.info("Fechando navegador")
        await closeBrowser();
    }
}

async function execute(params, id) {
    for await (let param of params) {
        let parameters = getParams(param)
        if (parameters[0] !== "url") {
            await start(parameters[0], parameters[1], id)
        }
    }
}

function sleep(mills) {
    return new Promise(resolve => setTimeout(resolve, mills))
}

function getUrl(params) {
    return getParams(params)[1]
}

function getParams(params) {
    return params.search('\n') !== -1
        ? params.split("\n")
        : params.split("=")
}

async function validSelector(value, callback){
    if(value.search(":")){
        let arraySelector = value.split(":")
        console.log(arraySelector[0].toString())
        return await callback(arraySelector[1], into($(arraySelector[0].toString())));
    }else{
        return await callback(value) 
    }
}

async function start(key, value, id) {
    const tags = {
        "input": async () => {
            log.info("Escrevendo no input...")
            await validSelector(value, write)
        },
        "click": async () => {
            log.info("Clicando no botao...")
            await validSelector(value, click);
        },
        "press": async () => {
            log.info("Pressionando no enter...")
            await validSelector(value, press);
        },
        "screenshot": async () => {
            log.info("Tirando screenshot...")
            await screenshot({ path: `./${id}.png` })
        },
        "sleep": async () => {
            log.info("Esperando...")
            await sleep(value)
        },
        "reload": async () => {
            log.info("Reload page...")
            await reload(value)
        }
    }

    return tags[key]()
}