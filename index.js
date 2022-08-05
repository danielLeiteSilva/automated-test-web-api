const express = require('express')
const  start  = require('./automated.js')
const app = express()

const port = process.env.PORT || 8080

app.use(express.json())

app.post("/api/v1/test", async (req, res) => {

    

    try {
        await start(req.body)
    } catch (error) {
        console.log(error)
    }

    res.status(200).json({ok: true})

})

app.listen(port, () =>
    console.log(`Connected on port ${port}`))