require('dotenv').config();
const path=require('path');

const express= require('express');
const session=require('express-session');
const mongoDBStrore=require('connect-mongodb-session')(session);
const { default: mongoose } = require('mongoose');
const DB_path= process.env.MONGO_URI;



const storeRouter=require("./routes/storerouter");
const hostRouter=require("./routes/hostRouter");
const authRouter=require("./routes/authRouter");
const rootDir=require("./utils/pathutil");
const { upload, useCloudinary } = require("./utils/multerConfig");
const errorsController= require("./controllers/errors");

const app=express();

app.set('view engine','ejs');
app.set('views','views');

const store= new mongoDBStrore({
    uri: DB_path,
    collection: 'sessions',
})


app.use(express.urlencoded());
app.use(upload);
app.use(express.static(path.join(rootDir,'public')));

if (!useCloudinary) {
    app.use("/uploads",express.static(path.join(rootDir,'uploads')));
    app.use("/host/uploads/",express.static(path.join(rootDir,'uploads')));
    app.use("/homes/uploads/",express.static(path.join(rootDir,'uploads')));
}



app.use(session({
    secret: process.env.SESSION_SECRET || "Aasharma",
    resave: false,
    saveUninitialized: true,
    store: store,
}));


app.use((req, res, next) => {
    // Read from the session instead of req.get('Cookie')
    req.isLoggedIn = req.session ? !!req.session.isLoggedIn : false;
    res.locals.isLoggedIn = req.isLoggedIn;
    res.locals.user = req.session.user || {};

    next();
});

app.use(authRouter);
app.use(storeRouter); 
app.use("/host",(req,res,next)=>{
    if(req.isLoggedIn){
     return next();
    }
    else {
        res.redirect("/login");
    }
    });
app.use("/host",hostRouter);

app.use(errorsController.pageNotFound);

const port= process.env.PORT || 4000;

mongoose.connect(DB_path).then(()=>{
    console.log('connected to Mongoose');
    app.listen(port,()=>{
    console.log(`server running on Address http://localhost:${port}`);
});
}).catch(err =>{
    console.log('error while connecting to moongose',err);
})