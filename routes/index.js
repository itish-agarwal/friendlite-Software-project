const express = require('express');

const router = express.Router();

const homeController = require('../controllers/home_controller');
const { route } = require('./users');


router.get('/', homeController.home);

//for all requests that comme with /users/....., access the router in users.js
router.use('/users', require('./users'));

router.use('/posts', require('./posts'));

router.use('/comments', require('./comments'));

router.use('/api', require('./api'));

router.use('/likes', require('./likes'));

router.use('/messages', require('./messages'));

module.exports = router;
//now use this exported router in index.js