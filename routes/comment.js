'use strict'

var express = require('express');
var commentController = require('../controllers/comment');

var router = express.Router();
var md_auth = require('../middleware/autenticar');

router.post('/comment/topic/:topicId', md_auth.autenticar , commentController.add);
router.put('/comment/:commentId', md_auth.autenticar , commentController.update);
router.delete('/comment/:topicId/:commentId', md_auth.autenticar , commentController.delete);


module.exports = router;