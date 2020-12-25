//this is a middleware used for putting the flash message stored in req.flash into res 

module.exports.setFlash = function(req, res, next) {
    res.locals.flash = {
        'success': req.flash('success'),
        'error': req.flash('error')
    }
    next();
}