const mongoose = require("mongoose")

const TripSchema = new mongoose.Schema({
    country: {
        type: String,
        lowercase: true,
    },
    city: {
        type: String,
        lowercase: true
    },
    article: {
        type: String,
        lowercase: true
    },
    imgURL:
        { type: String }
})

module.exports = mongoose.model("Trip", TripSchema)