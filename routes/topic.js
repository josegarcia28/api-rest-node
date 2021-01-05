'use strict'

var express = require('express');
var topicController = require('../controllers/topic');

var router = express.Router();
var md_auth = require('../middleware/autenticar');

router.get('/test', topicController.test);
router.post('/topic', md_auth.autenticar, topicController.save);
router.get('/topics/:page?', topicController.getTopics);
router.get('/user-topics/:user', topicController.getTopicByUser);
router.get('/topic/:id', topicController.getTopic);
router.put('/topic/:id', md_auth.autenticar, topicController.update);
router.delete('/topic/:id', md_auth.autenticar, topicController.delete);
router.get('/buscar/:buscar', topicController.buscar);


module.exports = router;