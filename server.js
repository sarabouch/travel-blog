const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer")

// connect the DB
require('dotenv').config({ path: "./variables.env" })
mongoose.connect(process.env.DATABASE);

app.use(express.static("public"))

//set HBS as a template engine 
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "hbs")

//use the body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//get the Schema from DB
const Trip = require("./models/Trip")

// using multer to specify the uploaded images location and change the naming
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            new Date()
                .toISOString()
                .replace(/:/g, "-")
                .replace(/\./g, "-") + file.originalname
        );
    }
});

const fileFilter = (req, file, cb) => {
    if (file) {
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/gif" ||
            file.mimetype === "image/svg"
        ) {
            cb(null, true);
        } else {
            cb(new Error("file Type Error"), false);
        }
    } else {
        cb(new Error("no file"), false);
    }
};

// the size of images
const uploadImage = multer({
    storage: imageStorage,
    limits: {
        fileSize: 1024 * 1024 * 20
    },
    fileFilter: fileFilter
});

// set routes

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/trips", async (req, res) => {
    await Trip.find().then(result => {
        res.render("trips", { result })
    })
        .catch(err => { throw err })
})

app.get("/contact", (req, res) => {
    res.render("contact")
})
app.get("/addnew", (req, res) => {
    res.render("addnew")
})

// create a new trip post and pass it to trip.hbs
app.post("/addcountry", uploadImage.single("imgURL"), async (req, res) => {
    const imagePath = req.file.path.split('/').slice(1, 3).join().replace(',', '/');
    let newTrip = createTrip(req.body, imagePath);
    await newTrip.save()
    await Trip.find().then(result => {
        res.render("trips", { result })
    })
        .catch(err => { throw err })
})

// we created this function to create a new object in the DB and save it
const createTrip = (data, filePath) => {
    return new Trip({
        country: data.country,
        city: data.city,
        article: data.article,
        imgURL: filePath
    });
};

app.listen(3000)