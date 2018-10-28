const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer")

// connect the DB
const mongoDB = "mongodb://trips:trips123@ds143893.mlab.com:43893/trips"
mongoose.connect(mongoDB);

app.use(express.static("public"))
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "hbs")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//get the Schema from DB
const Trip = require("./models/Trip")

// using multer to specify the uploaded images location and check the naming
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

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/trips", async (req, res) => {
    let allTrips = await Trip.find();
    res.render("trips")
})

app.get("/contact", (req, res) => {
    res.render("contact")
})
app.get("/addnew", (req, res) => {
    res.render("addnew")
})

// create a new trip post and pass it to trip.hbs
app.post("/addcountry", uploadImage.single("imgURL"), (req, res) => {
    let newTrip = createTrip(req.body, req.file);
    console.log(newTrip);
    // newTrip.save()
    res.render("trips", {
        city: `${req.body.city}`,
        country: `${req.body.country}`,
        article: `${req.body.article}`,
        imgURL: `${req.file.path}`
    })
})

const createTrip = (data, file) => {
    return new Trip({
        country: data.country,
        city: data.city,
        article: data.article,
        imgURL: file.path
    });
};

app.listen(3000)