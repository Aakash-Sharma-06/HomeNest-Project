const Home = require("../models/home");
const { getPhotoUrl, deletePhoto } = require("../utils/imageUtil");


exports.getAddHome = (req, res, next) => {
    res.render('Host/edit-home',{
        home: {},
        pageTitle: 'Add Home to Airbnb',
         currentPage: 'addHome',
         editing:false,
         isLoggedIn: req.isLoggedIn,
        user:req.session.user,
    });
}

exports.getEditHome = (req, res, next) => {
    const homeId=req.params.homeId;
    const editing=req.query.editing=='true';

    Home.findById(homeId).then(home=>{
        if(!home){
            console.log("home not found");
            return res.redirect("/host/host-home-list");
        }
        res.render('Host/edit-home',{
        home:home,
        pageTitle: 'Edit Home in Airbnb', 
        currentPage: 'Host-home',
        editing:editing,
         isLoggedIn: req.isLoggedIn,
        user:req.session.user,
    });
    })
}

exports.getHostHomes=(req,res,next)=>{
    Home.find().then(registerHome=>{
        res.render('Host/host-home-list',{
        registerHome: registerHome,
        pageTitle: 'Host-Homes List',
        currentPage:'Host-home',
         isLoggedIn: req.isLoggedIn,
        user:req.session.user,
        
    })
})
}

exports.postAddHome = async (req, res, next) => {
    try {
        const { houseName, price, location, rating, description } = req.body;

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
        });

        await home.save();
        console.log("home Saved success");
        res.redirect("/host/host-home-list");
    } catch (err) {
        console.error("Error adding home:", err);
        next(err);
    }
};


exports.postEditHome= (req,res,next)=>{
    const {id,houseName,price,location,rating,description}=req.body;

    Home.findById(id).then((home)=>{
        home.houseName=houseName,
        home.price=price;
        home.location=location;
        home.rating=rating;
        home.description=description;

        if(req.file){
            deletePhoto(home.photo).catch((err) => {
                console.log("Error while deleting old photo", err);
            });
            home.photo = getPhotoUrl(req.file);
        }
         
        home.save().then(result=>{
        console.log('home update',result);
        }).catch(err=>{
            console.log('Error While Updating',err);
        })
        res.redirect('/host/host-home-list'); 
            })
            .catch(err=>{
            console.log('Error While finding home',err);
 });
};

exports.postDeleteHome= (req,res,next)=>{
    const homeId=req.params.homeId;
    console.log("came ot del",homeId);
    Home.findByIdAndDelete(homeId).then(()=>{
        res.redirect("/host/host-home-list");
    }).catch(error=>{
          console.log("Error while delete",error); 
    })    
}