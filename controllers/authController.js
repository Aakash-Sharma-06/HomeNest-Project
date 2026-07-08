const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt=require('bcryptjs');

exports.getLogin = (req, res, next) => {
    res.render('auth/login',{
        pageTitle: 'Login',
        currentPage: 'Login',
        isLoggedIn: false,
        errors: [],
        oldInput: {email:""},
        user: {},
    });
};

exports.postLogin=async (req,res,next)=>{
    const {email,password}=req.body; 

    const user=await User.findOne({email});
    if(!user){

        return res.status(422).render("auth/login",{
        pageTitle:"Login",
        currentPage:"Login",
        isLoggedIn: false,
        errors: ["User does not exist"],
        oldInput:{email},
        user: {},
        });
    }

    const isMatch= await bcrypt.compare(password,user.password);
    if(!isMatch){

        return res.status(422).render("auth/login",{
        pageTitle:"Login",
        currentPage:"Login",
        isLoggedIn: false,
        errors: ["Invalid password"],
        oldInput:{email},
        user: {},
        });
    }

    req.session.isLoggedIn = true;
    req.session.user = {
        _id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        usertype: user.usertype,
    };
    await req.session.save();
    res.redirect(user.usertype === "host" ? "/host/host-home-list" : "/");
}


exports.postLogout=(req,res,next)=>{
    // res.cookie("isLoggedIn",false);

    req.session.destroy(()=>{
        res.redirect("/login");
    })
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup',{
        pageTitle: 'Signup',
        currentPage: 'Signup',
        isLoggedIn: false,
        errors: [],
        oldInput:{firstname:"", lastname:"", email:"",usertype:""},
        user: {},
    });
};

exports.postSignup=[
    check("firstname")
    .trim()
    .isLength({min:2})
    .withMessage("First name must ne 2 letter")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First name should only be Alphabet"),

    check("lastname")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("last name should only be Alphabet"),

    check("email")
    .isEmail()
    .withMessage("please enter a valid email")
    .normalizeEmail(),

    check("password")
    .isLength({min:5})
    .withMessage("password atleast need 5 lentgh")
    .matches(/[A-Z]/)
    .withMessage(" password must contain one uppercase letter")
    .matches(/[a-z]/)
    .withMessage(" password must contain one lowercase letter")
    .matches(/[0-9]/)
    .withMessage(" password must contain one number")
    .matches(/[\W]/)
    .withMessage(" password must contain one special character")
    .trim(),

    check("confirmPassword")
    .trim()
    .custom((value,{req})=>{
        if(value!== req.body.password){
            throw new Error("password not match");
        }
        return true;
    }),
    

    check("usertype")
   .notEmpty()
   .withMessage("please select a usertype")
   .bail()
   .toLowerCase()
   .isIn(['guest','host'])
   .withMessage("Invalid User type"),


    check("terms")
    .notEmpty()
    .withMessage("plese accept the T&C")
    .custom((value,{req})=>{
        if(value!== "on"){
            throw new Error("Please accept the T&C")
        }
        return true;
    }),

    (req,res,next)=>{
        const {firstname, lastname, email, password, usertype} = req.body;
        const errors= validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render("auth/signup",{
            pageTitle:"Signup",
            currentPage:"signup",
            isLoggedIn: false,
            errors: errors.array().map(err=> err.msg),
            oldInput:{firstname, lastname, email, password, usertype},
            user: {},
        });
    }

    bcrypt.hash(password,12).then(hashedPassword =>{
    const user = new User({ firstname, lastname, email, password:hashedPassword, usertype });
    return user.save();
    })
    .then(()=>{res.redirect("/login");
    })
    .catch(err =>{
        console.log('Error while save',err);
        return res.status(422).render("auth/signup",{
            pageTitle:"Signup",
            currentPage:"signup",
            isLoggedIn: false,
            errors: [err.message],
            oldInput:{firstname, lastname, email, password, usertype},
            user: {},
        });
    });
    }

]

