const Home = require("../models/home");
const user = require("../models/user");
const User=require("../models/user");

exports.getHomes=(req,res,next)=>{
    Home.find().then(registerHome=>{
        res.render('store/home-list',{registerHome: registerHome,
        pageTitle: 'Homes List  ',
        currentPage:'home',
         isLoggedIn: req.isLoggedIn,
        user:req.session.user,

    })
});
};

exports.getBookings=(req,res,next)=>{
        res.render('store/bookings',{
        pageTitle: 'My Bookings',
        currentPage:'bookings',
         isLoggedIn: req.isLoggedIn,
        user:req.session.user,

    })
}

exports.getFavouriteList= async (req,res,next)=>{
    try {
        const userId=req.session.user._id;
        const user= await User.findById(userId).populate('favourites');
        if (!user) {
            return res.redirect("/login");
        }
        res.render('store/favourite-list',{
            favouriteHome: user.favourites,
            pageTitle: 'My Favourite',
            currentPage:'favourite',
            isLoggedIn: req.isLoggedIn,
            user:req.session.user,
        });
    } catch (err) {
        next(err);
    }
}

exports.postAddToFavourite=async (req,res,next)=>{
    try {
        const homeId=req.body.id;
        const userId=req.session.user._id;
        const user=await User.findById(userId);
        if (!user) {
            return res.redirect("/login");
        }
        const alreadyFavourite = user.favourites.some(
            (id) => id.toString() === homeId
        );
        if (!alreadyFavourite) {
            user.favourites.push(homeId);
            await user.save();
        }
        res.redirect("/favourites");
    } catch (err) {
        next(err);
    }
}

exports.postRemoveFromFavourite=async (req,res,next)=>{
    try {
        const homeId=req.params.homeId;
        const userId=req.session.user._id;
        const user=await User.findById(userId);
        if (!user) {
            return res.redirect("/login");
        }
        user.favourites = user.favourites.filter(
            (fav) => fav.toString() !== homeId
        );
        await user.save();
        res.redirect("/favourites");
    } catch (err) {
        next(err);
    }
}
 
exports.getIndex=(req,res,next)=>{
    console.log("session value",req.session); 
    Home.find().then(registerHome=>{
        res.render('store/index',{
        registerHome: registerHome,
        pageTitle: 'HomeNest ',
        currentPage:'Index',
         isLoggedIn: req.isLoggedIn,
        user:req.session.user,
    })
    });
};

exports.getHomeDetails=(req,res,next)=>{
   const homeId=req.params.homeId;
   console.log("at home details page",homeId);
   Home.findById(homeId).then(home=>{
    if(!home){
        console.log("Home Not Found");
        res.redirect("/homes");
    }
    else{
        res.render('store/home-detail', {
            home:home,
            pageTitle: 'Home detail',
            currentPage:'Home',
          isLoggedIn: req.isLoggedIn,    
        user:req.session.user,
        })
    }
    })
  
}
