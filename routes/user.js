'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();
var md_auth = require('../middleware/autenticar');

// Configuracion para cargar las imagen del avatar
const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/users'});

// const expressFile = require('express-fileupload');
// router.use(expressFile());


// Rutas de prueba
router.get('/probando', UserController.probando);

// Rutas de usuario
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/user/update', md_auth.autenticar, UserController.update);
router.put('/upload-avatar', [md_auth.autenticar, md_upload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);


module.exports = router;