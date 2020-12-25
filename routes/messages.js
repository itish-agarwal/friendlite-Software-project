const express = require('express');

const router = express.Router();
const messagesController = require('../controllers/messages_controller');

router.get('/destroy/:id', messagesController.destroy);





module.exports = router;