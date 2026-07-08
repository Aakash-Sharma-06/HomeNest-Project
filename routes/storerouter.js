const express= require('express');
const storeRouter=express.Router();

const storeController=require("../controllers/storeController");

const requireLogin = (req, res, next) => {
    if (!req.isLoggedIn) {
        return res.redirect("/login");
    }
    next();
};

storeRouter.get("/",storeController.getIndex);
storeRouter.get("/homes",storeController.getHomes);
storeRouter.get("/bookings", requireLogin, storeController.getBookings);
storeRouter.get("/favourites", requireLogin, storeController.getFavouriteList);
storeRouter.get("/homes/:homeId",storeController.getHomeDetails);
storeRouter.post("/favourites", requireLogin, storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", requireLogin, storeController.postRemoveFromFavourite);

module.exports=storeRouter;
