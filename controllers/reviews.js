const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {  // we need campground id as well because we
    const { id,reviewId } = req.params                                      //need to remove 2 thing review itself and the  
    await Campground.findOneAndUpdate-(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)          
    // Campground.save();             
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}