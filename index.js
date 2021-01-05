'use strict'

var mongoose = require('mongoose');
const { post } = require('./app');
var app = require('./app');
var port = process.env.PORT || 3999;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', {useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => {
            console.log('La conexion de base de datos se realizo correctamente');
            app.listen(port, ()=> {
                console.log('El servidor esta funcionando');
            })
        })
        .catch(error => console.log(error));