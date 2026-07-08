const Home = require("../models/home");
const { getPhotoUrl, deletePhoto } = require("../utils/imageUtil");

function getHostId(req) {
    return req.session.user?._id;
}

exports.getAddHome = (req, res, next) => {
    res.render('Host/edit-home',{
        home: {},
        pageTitle: 'Add Home to HomeNest',
         currentPage: 'addHome',
         editing:false,
         isLoggedIn: req.isLoggedIn,
        user:req.session.user,
    });
}

exports.getEditHome = (req, res, next) => {
    const homeId=req.params.homeId;
    const editing=req.query.editing=='true';
    const hostId = getHostId(req);

    Home.findOne({ _id: homeId, host: hostId }).then(home=>{
        if(!home){
            console.log("home not found for this host");
            return res.redirect("/host/host-home-list");
        }
        res.render('Host/edit-home',{
        home:home,
        pageTitle: 'Edit Home in HomeNest', 
        currentPage: 'Host-home',
        editing:editing,
         isLoggedIn: req.isLoggedIn,
        user:req.session.user,
    });
    }).catch(err => next(err));
}

exports.getHostHomes=(req,res,next)=>{
    const hostId = getHostId(req);

    Home.find({ host: hostId }).then(registerHome=>{
        res.render('Host/host-home-list',{
        registerHome: registerHome,
        pageTitle: 'Host-Homes List',
        currentPage:'Host-home',
         isLoggedIn: req.isLoggedIn,
        user:req.session.user,
        
    })
}).catch(err => next(err));
}

exports.postAddHome = async (req, res, next) => {
    try {
        const hostId = getHostId(req);
        const { houseName, price, location, rating, description } = req.body;

        if (!hostId) {
            return res.redirect("/login");
        }

        if (!req.file) {
            console.log("NO image provided");
            return res.status(422).send("No image Provided");
        }

        const photo = getPhotoUrl(req.file);

        const home = new Home({
            houseName,
            price: Number(price),
            location,
            rating: Number(rating),
            photo,
            description,
            host: hostId,
        });

        await home.save();
        console.log("home Saved success for host", hostId);
        res.redirect("/host/host-home-list");
    } catch (err) {
        console.error("Error adding home:", err);
        next(err);
    }
};


exports.postEditHome= async (req,res,next)=>{
    try {
        const hostId = getHostId(req);
        const {id,houseName,price,location,rating,description}=req.body;

        const home = await Home.findOne({ _id: id, host: hostId });
        if (!home) {
            return res.redirect("/host/host-home-list");
        }

        home.houseName=houseName;
        home.price=Number(price);
        home.location=location;
        home.rating=Number(rating);
        home.description=description;

        if(req.file){
            await deletePhoto(home.photo).catch((err) => {
                console.log("Error while deleting old photo", err);
            });
            home.photo = getPhotoUrl(req.file);
        }
         
        await home.save();
        console.log("home update", home._id);
        res.redirect("/host/host-home-list");
    } catch (err) {
        console.log("Error While Updating", err);
        next(err);
    }
};

exports.postDeleteHome= async (req,res,next)=>{
    try {
        const homeId=req.params.homeId;
        const hostId = getHostId(req);

        await Home.findOneAndDelete({ _id: homeId, host: hostId });
        res.redirect("/host/host-home-list");
    } catch (error) {
        console.log("Error while delete", error);
        next(error);
    }
}
