const express = require('express')
const path = require("path")
const main = require('./taiko.js')
const bodyParser = require("body-parser")
const jwt = require('jsonwebtoken')
const app = express()
const fs = require('fs')

const port = process.env.PORT || 8080

app.use(express.json())
app.use(bodyParser.text());

const Cache = require("./Cache")
const cache = new Cache("cache.json")

const Log = require("./Log")
const log = new Log()

app.post("/api/v1/access_token", (req, res) => {
    let access_token = jwt.sign({ foo: 'bar' },
        "shhhhh")
    res.status(200).json({ access_token })
})

function auth(req, res, next) {
    let token = req.headers["authorization"].split(/\s/)[1]
    jwt.verify(token, "shhhhh", function (err, decoded) {
        if (!err) {
            if (decoded.foo === "bar") {
                next()
            }
        }
        res.status(401).json({ status_code: 401, message: "This token is not valid" })
    });
}

app.post("/api/v1/test", async (req, res) => {
    const cacheRegister = cache.registerCache()
    try {
        main(req, cacheRegister["id"])
    } catch (error) {
        console.log(error)
    }
    res.status(200).json({ status_code: 200, ...cacheRegister })
})

app.get("/api/v1/state/:id", (req, res) => {

    const id = req.params.id
    const cacheRegister = cache.readCache()
    const result = cacheRegister
        .find(element => element.id === id)

    res.status(200).json({ status_code: 200, ...result })
})

app.get("/api/v1/download/:id", (req, res) => {
    const file = path.join(__dirname, ".", `${req.params.id}.pdf`)
    if (fs.existsSync(file)) {
        res.status(204).download(file)
    } else {
        res.status(404).json({
            status_code: 404, id: req.params.id,
            message: "This file was excluded or not exists"
        })
    }
})

app.delete("/api/v1/delete/:id", auth, (req, res) => {

    const filePdf = path.join(__dirname, ".", `${req.params.id}.pdf`)
    const filePng = path.join(__dirname, ".", `${req.params.id}.png`)

    if (fs.existsSync(filePdf) && fs.existsSync(filePng)) {

        fs.unlinkSync(filePdf)
        fs.unlinkSync(filePng)
        res.status(200).json({
            status_code: 200,
            id: req.params.id,
            Ïstate: "Excluded"
        })
    }

    log.info("Esse arquivo não existe ou já foi excluido")
    res.status(404).json({
        status_code: 404, id: req.params.id,
        message: "This file was excluded or not exists"
    })
})

app.listen(port, () =>
    console.log(`Connected on port ${port}`))