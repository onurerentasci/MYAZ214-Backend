
const mongoose = require('mongoose')
exports.connectToMongoDb = async() => {
    try {
        await mongoose.connect('mongodb://0.0.0.0:27017/ytp', {
            compressors: "zlib",
            autoIndex: true,
            connectTimeoutMS: 5000
        })
       console.log("DB Bağlandı")
    } catch (error) {
        console.log('error', error)
        throw new Error(error)
    }
}