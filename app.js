if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//added new comment hello
const express = require('express')
const path = require('path')
const mongoose = require('mongoose');
//this is the styling part for yelpcamp
const ejsMate = require('ejs-mate')
// joi lets you describe your data using a simple, intuitive, and readable language.
const methodoverride = require('method-override')
// const { nextTick } = require('process');
const flash=require('connect-flash')
const session=require('express-session')
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError');
const passport=require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet=require('helmet');
const MongoStore = require('connect-mongo');

const mongoSanitize = require('express-mongo-sanitize'); //common security issues

const campgroundRoutes=require('./routes/campground')
const reviewRoutes=require('./routes/review')
const userRoutes = require('./routes/users');
//configuring session

// const MongoDBStore = require("connect-mongo")(session);
const dbUrl =  process.env.DB_URL||'mongodb://localhost:27017/yelp-camp';


mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodoverride('_method'))
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize({ // It doesn't allow any keys that contains a dollar sign or a period
    replaceWith: '_'
}))

// deployment
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // lazy update
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
const sessionConfig={
    store, //deployment
    name:'session', // this provide default name for sessionCookie
    secret:"thisisthesecret",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true, //if we enable this then it will only accept https so if  we try to login to local host it will not work
        expires:Date.now() + 1*24*60*60*1000//after 1week( since we don't want any user to be signed in for all time )
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())

//content policy security
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmcpsogad/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//use passport
app.use(passport.initialize());
app.use(passport.session()); // this part should always come after app.use(session);
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//using flash
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

// const validateCampground = (req, res, next) => {

//     const { error } = campgroundSchema.validate(req.body)
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     }
//     else {
//         next()
//     }
// }
// //making middleware for review
// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body)
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     }
//     else {
//         next()
//     }
// }
//after creating express router
app.use('/', userRoutes);
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
});


// app.get('/campground', catchAsync(async (req, res) => {
//     const campgrounds = await campground.find({})
//     res.render('campgrounds/index', { campgrounds })
// }))
// // new
// app.get('/campground/new', (req, res) => {
//     res.render('campgrounds/new')
// })


// app.post('/campground', validateCampground, catchAsync(async (req, res, next) => {
//     // we have to parse the request before adding it to the body
//     // try{
//     //since we have made another file in utilities folder for catchAsync we don't have to write try and catch mannualy we can do  catchAsync outside async
//     // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400)// since if we put invalid data in any of the field in new campground it should not accept it at the backend for that reason we have used ExpressError here
//     //defining our own schema for validation
//     // copied from joi documentation

//     const Campground = new campground(req.body.campground)
//     await Campground.save()
//     res.redirect(`/campground/${Campground.id}`)
//     // }catch(e){
//     //     next(e)
//     // }
// }))
// // show 
// app.get('/campground/:id', catchAsync(async (req, res) => {
//     const Campground = await campground.findById(req.params.id).populate('reviews')
//     res.render('campgrounds/show', { Campground })
// }))
// // edit
// app.get('/campground/:id/edit', catchAsync(async (req, res) => {
//     const Campground = await campground.findById(req.params.id)
//     res.render('campgrounds/edit', { Campground })
// }))
// app.put('/campground/:id', catchAsync(async (req, res) => {
//     const { id } = req.params
//     const Campground = await campground.findByIdAndUpdate(id, { ...req.body.Campground })
//     res.redirect(`/campground/${Campground._id}`)
// }))
// //delete
// app.delete('/campground/:id', catchAsync(async (req, res) => {
//     const { id } = req.params
//     await campground.findByIdAndDelete(id)
//     res.redirect('/campground')
// }))
// // route for review model
// //adding validation for review model
// app.post('/campground/:id/reviews', validateReview, catchAsync(async (req, res) => {
//     const Campground = await campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     Campground.reviews.push(review);
//     await review.save();
//     await Campground.save();
//     res.redirect(`/campground/${Campground._id}`);
// }))
// //delete for review
// // we will use a mongoose operator called pull for delete the reference
// // we have to take care of one thing that if the campground is deleted then all the associated review should also be deleted
// // so we have to put a middleware in the campground model which will check if is there any review
// app.delete('/campground/:id/reviews/:reviewId', catchAsync(async (req, res) => {  // we need campground id as well because we
//     const { id,reviewId } = req.params                                      //need to remove 2 thing review itself and the  
//     await campground.findOneAndUpdate-(id,{$pull:{reviews:reviewId}})
//     await Review.findByIdAndDelete(reviewId)          
//     // Campground.save();             
//     res.redirect(`/campground/${id}`)
// }))

// if url does not match 
app.all('*', (req, res, next) => {
    //app.all() function is used to routing all types of HTTP request. Like if we have POST, GET, PUT, DELETE, etc, request made to any specific route, let say /user, so instead to defining different API’s like app.post(‘/user’), app.get(‘/user’), etc, we can define single API app.all(‘/user’) which will accept all type of HTTP request.
    next(new ExpressError('Page Not Found', 404))// since we are passing it to next that means it is going to hit app.use 
})
//Basic error handler
app.use((err, req, res, next) => {
    const {statusCode = 500 } = err
    if (!err.message) err.message = 'Oh no, Something went wrong!'
    // res.status(statusCode).send(message)
    res.status(statusCode).render('error', { err })

    // res.send('Something Went Wrong!')
})
app.listen(80, () => {
    console.log("listening to port 80")

})
