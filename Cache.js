const crypto = require("crypto")
const fs = require('fs')
const path = require('path')

//Models
const CacheModel = require("./CacheModel")

module.exports = class Cache {
    constructor(cacheFile) {
        this._cacheFile = cacheFile
        this._cachePathFile = path.join(__dirname, ".", cacheFile)
    }

    generateId() {
        return crypto.randomBytes(16).toString("hex");
    }

    registerCache() {
        let id = this.generateId()
        let data = JSON.stringify([new CacheModel(id, "Pending")])
        if (!fs.existsSync(this._cachePathFile)) {
            fs.writeFileSync(this._cachePathFile, data)
        } else {
            let cache = this.readCache()
            cache.push(new CacheModel(id, "Pending"))
            fs.writeFileSync(this._cachePathFile, JSON.stringify(cache))
        }

        return JSON.parse(data)[0]
    }

    readCache() {
        let buffer = fs.readFileSync(this._cachePathFile)
        return this.toJson(buffer)
    }

    toJson(buffer) {
        return JSON.parse(Buffer.from(buffer).toString())
    }

    updateCache(id, value) {
        let cache = this.readCache()
        let element = cache.find(element => element.id === id)
        cache = this.removeCache(id)
        element.state = value
        cache.push(element)
        fs.writeFileSync(this._cachePathFile, JSON.stringify(cache))
    }

    removeCache(id){
        let cache = this.readCache()
        return cache.filter(element => element.id !== id )
    }
}