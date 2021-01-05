'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

var controller = {
   probando: function(req, res){
       return res.status(200).send({
           messaje: 'entro en probando'
       });
   },

   save: function(req, res){
       // Recoger parametros de la peticion
       var params = req.body;

       // Validar los datos
        try{
            var val_name = !validator.isEmpty(params.name);
            var val_surname = !validator.isEmpty(params.surname);
            var val_email = !validator.isEmpty(params.surname) && validator.isEmail(params.email);
            var val_password = !validator.isEmpty(params.password);
        } catch(err) {
            return res.status(500).send({
                mensaje: 'faltan datos por enviar'
            });
        }

       if(val_name && val_surname && val_email && val_password){
           // Asignar parametros
           var user = new User();

           user.name = params.name;
           user.surname = params.surname;
           user.email = params.email.toLowerCase();
           user.role = 'ROLE_USER';
           user.image = null;

           // Verificar si el usuario existe
           User.findOne({email: user.email}, (err, resp) => {
               if(err){
                   return res.status(500).send({
                       message: 'Error al probar duplicidad en los datos'
                   });
               }
               if(!resp){
                   // Cifrar la contrasena
                   bcrypt.hash(params.password, null, null, (err, hash) => {
                       user.password = hash;

                       // Guardar el usuario
                       user.save((err, userSave) => {
                            if(err){
                                return res.status(500).send({
                                    message: 'Error al guardar el usuario'
                                });
                            }
                            if(!userSave){
                                return res.status(400).send({
                                    message: 'Error el usuario no se ha guardado'
                                });
                            } 
                            return res.status(200).send({
                                message: 'Usuario registrado exitosamente',
                                user
                            });
                       })
                   })

               } else {
                    return res.status(500).send({
                        message: 'El usuario ya esta registrado'
                    });
               }
           })

          
       } else {
        return res.status(200).send({
            messaje: "La validacion de los datos es incorrecto"
            
        });
    }

   },
   login: function(req, res){
       // Recoger los parametros
       var params = req.body;

       
       // validar los datos
       try{
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch(err) {
            return res.status(500).send({
                mensaje: 'faltan datos por enviar'
            });
        }
       if(!validate_email || !validate_password){
            return res.status(500).send({
                mensaje: 'Los datos son incorrectos envialos bien'
            });
       }

       // Buscar los usuarios que coincidan con el email
       User.findOne({email: params.email.toLowerCase()}, (err, user) => {
           if(err){
                return res.status(500).send({
                    mensaje: 'Error al intentar identificarse'
                });
           }
           if(!user){
               return res.status(404).send({
                   mensaje: 'El usuario no existe'
               });
           }
           // compara si la password es correcta
           bcrypt.compare(params.password, user.password, (err, check) => {
               if(check){
                    // Generar el token
                    if(params.gettoken){
                        return res.status(200).send({
                            token: jwt.creteToken(user)
                        });
                    }

                   // Limpiar datos
                   user.password = undefined;

                   return res.status(200).send({
                        mensaje: 'success',
                        user
                    });

               } else {
                    return res.status(200).send({
                        mensaje: 'La contrasena suministrada es incorrecta'
                    });
               }
               if(err){
                   return res.status(404).send({
                       mensaje: 'Error al comparar la contrasena'
                   });
               }
            });
       });
   },
   update: function(req, res){
       // Recoger los datos del usuario
      
        var params = req.body;

        // Validar los datos
        try{
            var val_name = !validator.isEmpty(params.name);
            var val_surname = !validator.isEmpty(params.surname);
            var val_email = !validator.isEmpty(params.surname) && validator.isEmail(params.email);
        } catch(err) {
            return res.status(500).send({
                mensaje: 'faltan datos por enviar'
            });
        }
        // Eliminar propiedades innecesarias
        delete params.password;

        var userId = req.user.sub;

        // Comprobar si el email es unico
        //if(req.user.email != params.email){
        User.findOne({email: params.email.toLowerCase()}, (err, user) => {
            if(err){
                // console.log('entro');
                    return res.status(500).send({
                        mensaje: 'Error al buscar el email'
                    });
            }
            // if(user){
            //     return res.status(404).send({
            //         mensaje: 'El email ingresado ya existe'
            //     });
            // }
            // if(!user){
                // Buscar y actualizar documentos
                User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userActua) => {

                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            mensaje: 'No se pudieron actualizar los datos'
                        });
                    }
    
                    if(!userActua){
                        return res.status(500).send({
                            status: 'error',
                            mensaje: 'No se actualizo el usuario'
                        });
                    }
    
                    return res.status(200).send({
                        status: 'success',
                        mensaje: 'Ya se puede Actualizar',
                        userActua
                    });
                });

            //}
        });    

   },

   uploadAvatar: function(req, res){
        // Recoger el fichero de la peticion

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(404).send({
                status: 'error',
                mensaje: 'No se subio la imagen'
            });
        } 
        
        // Conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var ext_file = ext_split[1];

        // Comprobar la extesion (solo imagen)
        if(ext_file != 'png' && ext_file != 'jpg' && ext_file != 'jpeg' && ext_file != 'gif'){
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    mensaje: 'La extension del archivo no es valida'
                });
            })
        } else {
            // Sacar el id del usuario identificado
            var userId = req.user.sub;

            // Buscar y actualizar documento en la bd
            User.findOneAndUpdate({_id: userId}, {image: file_name}, {new: true}, (err, userUpdate) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        mensaje: 'Error al buscar el usuario'
                    });
                }
                
                return res.status(200).send({
                    status: 'success',
                    mensaje: 'Se subio el archivo',
                    user: userUpdate
                });
            });

        }

   },

   avatar: function(req, res){
        var fileName = req.params.fileName;
        var filePath = './uploads/users/'+fileName;

        fs.exists(filePath, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(filePath));
            } else {
                return res.status(404).send({
                    message: 'imagen no existe'
                });
            }
        })

   },

   getUsers: function(req, res){
       User.find().exec((err, resp) => {
           if(err){
               return res.status(404).send({
                   status: 'error',
                   mensaje: 'No hay datos que mostrar'
               });  
           }
           return res.status(200).send({
                status: 'success',
                users: resp
            });
       });
   },

   getUser: function(req, res){
       var userId = req.params.userId;

       User.findById(userId).exec((err, user) => {
            if(err){
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'No se encontro el usuario'
                });  
            }
            return res.status(200).send({
                status: 'success',
                user: user
            });
       });
   }
}

module.exports = controller;