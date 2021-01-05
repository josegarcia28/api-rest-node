'use strict'

var Topic = require('../models/topic');
var validator = require('validator');

var controller = {
    add: function(req, res){
        // Recoger el id de topic por la url
        var topicId = req.params.topicId;

        // busqueda de topic por id
        Topic.findById(topicId).exec((err, topic) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    mensaje: 'No se encontro topic con ese ID'
                });
            }
            if(!topic){
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'el topic esta vacio'
                });
            }
            // Comprobar objeto de usuario y validarlos
            //if(req.body.content){
                // Validar los datos
                try{
                    var val_content = !validator.isEmpty(req.body.content);
                    
                } catch(err) {
                    return res.status(500).send({
                        status: 'error',
                        mensaje: 'faltan datos por enviar'
                    });
                }

                if(val_content){
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content
                    };
                    // En la propiedad comment del objeto resultante hacer un push
                    topic.comments.push(comment);
                    
                    // Guardar el topic completo
                    topic.save((err) => {
                        if(err){
                            return res.status(404).send({
                                status: 'error',
                                mensaje: 'Error al guardar el topic'
                            });
                        }
                        // Busco el topic
                        Topic.findById(topic._id)
                        .populate('user')
                        .populate('comments.user')
                        .exec((err, topic) => {
                            if(err){
                            return res.status(404).send({
                                status: 'error',
                                mensaje: 'No hay topic con ese ID'
                            });
                            } 
                            if(!topic){
                            return res.status(404).send({
                                status: 'error',
                                mensaje: 'No hay topic para mostrar'
                            });
                            } 
                            return res.status(200).send({
                                status: 'success',
                                mensaje: 'Se agrego el comentario exitosamente',
                                topic
                            });
                        })
                    });
                } else {
                    return res.status(404).send({
                        status: 'error',
                        mensaje: 'Error al validar los comentarios'
                    });
                }
            // } elser {
            //     return res.status(404).send({
            //         status: 'error',
            //         mensaje: 'Error al validar los comentarios'
            //     });
            // }
            
        });
    },

    update: function(req, res){
        // conseguir el id de comentario que nos llega por url
        var commentId = req.params.commentId;

        // Recoger los datos y validar 
        var params = req.body;

        try{
            var val_content = !validator.isEmpty(params.content);
            
        } catch(err) {
            return res.status(500).send({
                status: 'error',
                mensaje: 'faltan datos por enviar'
            });
        }
        //console.log(commentId);
        if(val_content){
            Topic.findOneAndUpdate(
                {"comments._id": commentId},
                {
                    "$set": {
                        "comments.$.content": params.content
                    }
                },
                {new: true},
                (err, topicUpdate) => {
                    if(err){
                        return res.status(404).send({
                            status: 'error',
                            mensaje: 'Error no se pudo actualizar el comentario'
                        });
                    }
                    if(!topicUpdate){
                        return res.status(404).send({
                            status: 'error',
                            mensaje: 'el topic esta vacio'
                        });
                    }
                    return res.status(200).send({
                        status: 'success',
                        mensaje: 'actualizo comentarios entro',
                        topic: topicUpdate
                    });
                }
            );
        }

    },

    delete: function(req, res){
        // conseguir el id de comentario que nos llega por url
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        // Buscar el topic
        Topic.findById(topicId, (err, topic) => {
            if(err){
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'Error no se encontro el comentario'
                });
            }
            if(!topic){
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'el topic esta vacio'
                });
            }
            // Seleccionar el subdocumento (comentario)
            var comment = topic.comments.id(commentId);

            if(comment){
                // borrar el comentario
                comment.remove();

                // guardo el topic
                topic.save((err) => {
                    if(err){
                        return res.status(404).send({
                            status: 'error',
                            mensaje: 'Error no se pudo guardar el topic'
                        });
                    }
                });
                // Busco el topic
                Topic.findById(topic._id)
                .populate('user')
                .populate('comments.user')
                .exec((err, topic) => {
                    if(err){
                    return res.status(404).send({
                        status: 'error',
                        mensaje: 'No hay topic con ese ID'
                    });
                    } 
                    if(!topic){
                    return res.status(404).send({
                        status: 'error',
                        mensaje: 'No hay topic para mostrar'
                    });
                    } 
                    return res.status(200).send({
                        status: 'success',
                        mensaje: 'se borro correctamente',
                        topic
                    });
                    
                })

            } else {
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'no se encontro el comentario a eliminar'
                });
            }
        });

    }
}

module.exports = controller;