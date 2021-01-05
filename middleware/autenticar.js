'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

var secret = "clave-secreta-para-generar-token-999";

exports.autenticar = function(req, res, next){
    // Verificar que lleque la autorizacion
    if(!req.headers.authorization){
        return res.status(404).send({
            messaje: 'No se encontro la cabecera Authorization'
        });
    }

    // Limpiar el token
    var token = req.headers.authorization.replace(/['"]+/g, '');

    try{
        // Decodificar el token
        var payload = jwt.decode(token, secret);

        // Comprobar si el token a expirado
        if(payload.exp <= moment().unix()){
            return res.status(404).send({
                messaje: 'El token ha expirado'
            });
        }



    } catch(ex){
        return res.status(404).send({
            messaje: 'El token no es valido'
        });
    }
    
    // Adjuntar usuarios identificados a la request
    req.user = payload;

    //console.log('estas pasando por el middleware');
    next();
}