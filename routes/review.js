const express=require('express')
const router=express.Router({mergeParams: true }) // here we have used mergeParams to import the params from other models such as id
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews=require('../controllers/reviews')
const Review = require('../models/review')
// const { reviewSchema } = require('../schema.js')

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))   
//delete for review
// we will use a mongoose operator called pull for delete the reference
// we have to take care of one thing that if the campground is deleted then all the associated review should also be deleted
// so we have to put a middleware in the campground model which will check if is there any review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports=router;