'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
    test: function(req, res){
        res.status(200).send({
            mensaje: 'entro en el controlador de topic'
        });
    },

    save: function(req, res){
        // Recoger parametros de la peticion
       var params = req.body;

       // Validar los datos
        try{
            var val_title = !validator.isEmpty(params.title);
            var val_content = !validator.isEmpty(params.content);
            var val_lang = !validator.isEmpty(params.lang);
            
        } catch(err) {
            return res.status(500).send({
                mensaje: 'faltan datos por enviar'
            });
        }

        if(val_title && val_content && val_lang){
            var topic = new Topic;

            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;
             
            // Guardar datos
            topic.save((err, topicStore) => {
                if(err){
                    res.status(404).send({
                        status: 'error',
                        mensaje: 'No se pudo guardar'
                    });
                }

                res.status(200).send({
                    status: 'success',
                    mensaje: 'Los datos se guardaron exitosamente',
                    topic: topicStore
                });
            })


        } else {
            res.status(200).send({
                mensaje: 'Los datos no son validos'
            });
        }

    },

    getTopics: function(req, res){
        var page = req.params.page;

        if(!page || page == null || page == undefined || page == 0){
            page = 1;
        } else {
            page = parseInt(page);
        }

        // Configurar las opciones de paginacion
        var options = {
            sort:     { date: -1 },
            populate: 'user', 
            page: page,
            limit: 5
        };
        
        Topic.paginate({}, options, (err, topicPag) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    error: err,
                    messaje: 'no se pudo paginar'
                })
            }
            if(!topicPag){
                return res.status(404).send({
                    status: 'error',
                    messaje: 'no hay topic'
                })
            }

            return res.status(200).send({
                status: 'success',
                topics: topicPag.docs,
                totalDocs: topicPag.totalDocs,
                totalPages: topicPag.totalPages
            });

        });
    },

    getTopicByUser: function(req, res){
        // Conseguir el parametro de la url
        var UserId = req.params.user;

        // buscar segun condicion 
        Topic.find({
            user: UserId
        })
        .sort([['date', 'descending']])
        .exec((err, topic) => {
            //Devolver los resultados
            if(err){
                return res.status(500).send({
                    status: 'error',
                    mensaje: 'No encontro datos con ese ID'
                })
            }
            if(err){
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'No hay topic para mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                topic
            });

        });
    },

    getTopic: function(req, res){
        //Obtener el topic de la url
        var topicId = req.params.id;

        // Busco el topic
        Topic.findById(topicId)
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
                     topic
                 });
             })

    },

    update: function(req, res){
        // recoger los datos
        var topicId = req.params.id;
        var params = req.body;

        // Validar los datos
        try{
            var val_title = !validator.isEmpty(params.title);
            var val_content = !validator.isEmpty(params.content);
            var val_lang = !validator.isEmpty(params.lang);
            
        } catch(err) {
            return res.status(500).send({
                mensaje: 'faltan datos por enviar'
            });
        }

        if(val_title && val_content && val_lang){
            // Montar en un json los datos modificables
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            }

            Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new: true}, (err, topicUpdate) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        mensaje: 'No hay topic con ese ID'
                    });
                 } 
                 if(!topicUpdate){
                    return res.status(404).send({
                        status: 'error',
                        mensaje: 'No hay topic para mostrar'
                    });
                 }
                 return res.status(200).send({
                     status: 'success',
                     topicUpdate
                 });
            });


        } else {
            res.status(200).send({
                mensaje: 'Los datos no son validos'
            });
        }

    },

    delete: function(req, res){
        // recoger id del topic
        var topicId = req.params.id;

        // Buscar el registro a eliminar
        Topic.findByIdAndDelete({_id: topicId, user: req.user.sub}, (err, resp) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    mensaje: 'No hay topic con ese ID'
                });
             } 
             if(!resp){
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'No se ha borrado el topic'
                });
             }
            return res.status(200).send({
                status: 'success',
                mensaje: 'Registro se borro exitosamente',
                topic: resp
            });
        });

    },

    buscar: function(req, res){
        // Sacar string a buscar por el url
        var stringBuscar = req.params.buscar;

        Topic.find({ "$or": [
            { "title": { "$regex": stringBuscar, "$options": "i"} },
            { "content": { "$regex": stringBuscar, "$options": "i"} },
            { "code": { "$regex": stringBuscar, "$options": "i"} },
            { "lang": { "$regex": stringBuscar, "$options": "i"} }
        ]})
        .populate('user')
        .sort([['date', 'descending']])
        .exec((err, topic) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    mensaje: 'No hay topic para su peticion'
                });
             } 
             if(!topic){
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'No se ha encontrado el topic'
                });
             }
             return res.status(200).send({
                 status: 'success',
                 topic
             });
        });
    }
}

module.exports = controller;