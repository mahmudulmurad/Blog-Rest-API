const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
const db = mongoose.connection;
db.on("error", (err) => {
    console.log(err.message);
});

db.once("open", () => {
    console.log("MongoDB connection success");
});