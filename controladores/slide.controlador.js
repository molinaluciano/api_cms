/*========================
IMPORTAMOS EL MODELO
========================== */
const Slide = require('../modelos/slide.modelo');
/*========================
ADMINISTRACION DE CARPETAS Y ARCHIIVOS NODEJS
========================== */
const fs = require('fs');
//PErmite trabajar con la rutas del servido y viene por defecto
const path = require('path');
const {
    Promise
} = require('mongoose');
const {
    exists
} = require('../modelos/slide.modelo');

/*========================
PETICION GET
========================== */
let mostrarSlide = (req, res) => {
    //https://mongoosejs.com/docs/api.html#model_Model.find
    Slide.find({}).exec((err, data) => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en la peticion"
            })
        }
        //Contar la cantidad de registros
        Slide.countDocuments({}, (err, total) => {
            res.json({
                status: 200,
                total,
                data

            })
        })


    });

};
/*========================
PETICION POST
========================== */
let crearSlide = (req, res) => {
    //Obtenemos el cuerpo del formulario
    let body = req.body;
    //Consulta  si no esta recibiendo archivo para tirar el error
    if (!req.files) {
        return res.json({
            status: 500,
            mensaje: "La imagen no puede ir vacia"
        })
    }
    //Capturamos el archivo
    let archivo = req.files.archivo;
    console.log(archivo); //Vemos lo que archivo nos carga
    //Validamos la extension del archivo
    if (archivo.mimetype != 'image/jpeg' && archivo.mimetype != 'image/png') {
        return res.json({
            status: 400,
            mensaje: "La imagen debe ser formato JPG o PNG"
        })
    }
    //Validamos el tamaño
    if (archivo.size > 2000000) {
        return res.json({
            status: 400,
            mensaje: "La imagen debe ser inferior a 2MB"
        })
    }
    //Cambiar nombre del archivo
    let nombre = Math.floor(Math.random() * 10000);
    console.log(nombre);

    //Capturar la extension del archivo
    let extension = archivo.name.split('.').pop(); //con pop sacamos el ultimo valor
    console.log(extension);
    //Movemos el archivo a la carpeta
    archivo.mv(`./archivos/slide/${nombre}.${extension}`, err => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error al guardar la imagen",
                err
            })
        }

        //Obtenemos los datos del formulario para pasarlo al modelo
        let slide = new Slide({
            imagen: `${nombre}.${extension}`,
            titulo: body.titulo,
            descripcion: body.descripcion
        })
        console.log(slide);

        //Guardar en MongoDB
        // https://mongoosejs.com/docs/api.html#model:Model-save
        slide.save((err, data) => {
            if (err) {
                return res.json({
                    status: 400,
                    mensaje: "Error al almacenar el slide",
                    err
                })
            }
            res.json({
                status: 200,
                data,
                mensaje: "El slide ha sido creado con exito"
            })
        })

    })

}
/*========================
PETICION PUT
========================== */
let editarSlide = (req, res) => {
    //Capturamos el id del slide a actualizar
    let id = req.params.id;
    //Obtenemos el cuerpo del formulario
    let body = req.body;
    /*========================
    1. VALIDAMOS QUE EL SLIDE SI EXISTA
    ========================== */
    //findById es funcion propia de mongoose
    //https://mongoosejs.com/docs/api.html#model_Model.findById
    Slide.findById(id, (err, data) => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en el servidor",
                err
            })
        }

        //Validamos que el slide exista
        if (!data) {
            return res.json({
                status: 404,
                mensaje: "No existe el slide en la base de datos",
                err
            })
        }

        let rutaImagen = data.imagen;
        /*========================
        2. VALIDAMOS QUE HAYA CAMBIO DE IMAGEN con promise
        ========================== */
        let validarCambioArchivo = (req, rutaImagen) => {
            return new Promise((resolve, reject) => {
                if (req.files) {

                    //Capturamos el archivo
                    let archivo = req.files.archivo;
                    console.log(archivo); //Vemos lo que archivo nos carga
                    //Validamos la extension del archivo
                    if (archivo.mimetype != 'image/jpeg' && archivo.mimetype != 'image/png') {
                        return res.json({
                            status: 400,
                            mensaje: "La imagen debe ser formato JPG o PNG"
                        })
                        let respuesta = {
                            res: res,
                            mensaje: "La imagen debe ser formato JPG o PNG"

                        }
                        reject(respuesta);
                    }
                    //Validamos el tamaño
                    if (archivo.size > 2000000) {
                        return res.json({
                            status: 400,
                            mensaje: "La imagen debe ser inferior a 2MB"
                        })
                        let respuesta = {
                            res: res,
                            mensaje: "La imagen debe ser inferior a 2MB"

                        }
                        reject(respuesta);
                    }
                    //Cambiar nombre del archivo
                    let nombre = Math.floor(Math.random() * 10000);
                    console.log(nombre);

                    //Capturar la extension del archivo
                    let extension = archivo.name.split('.').pop(); //con pop sacamos el ultimo valor
                    console.log(extension);

                    //Movemos el archivo a la carpeta
                    archivo.mv(`./archivos/slide/${nombre}.${extension}`, err => {
                        if (err) {
                            return res.json({
                                status: 500,
                                mensaje: "Error al guardar la imagen",
                                err
                            })

                            let respuesta = {
                                res: res,
                                mensaje: "Error al guardar la image"

                            }
                            reject(respuesta);

                        }
                        //Borramos antiigua imagen
                        if (fs.existsSync(`./archivos/slide/${rutaImagen}`)) {
                            fs.unlinkSync(`./archivos/slide/${rutaImagen}`); //Que borre
                        }
                        //Damos valor a nueva imagen
                        rutaImagen = `${nombre}.${extension}`;
                        resolve(rutaImagen);

                    })
                } else { //Sino se devuelve como entra
                    resolve(rutaImagen);
                }
            })
        }
        /*========================
        3. ACTUALIZAMOS LOS REGISTROS con promise
        ========================== */
        let cambiarRegistroBD = (id, body, rutaImagen) => {
            return new Promise((resolve, reject) => {


                let datosSlide = {
                    imagen: rutaImagen,
                    titulo: body.titulo,
                    descripcion: body.descripcion
                }
                //Actualizamos en MongoDB
                //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
                Slide.findByIdAndUpdate(id, datosSlide, {
                    new: true, // Con esto me muestra lo que se guardo y no el antiguo
                    runValidators: true // Con esto me muestra lo que se guardo y no el antiguo
                }, (err, data) => {
                    if (err) {
                        let respuesta = {
                            res: res,
                            error: error
                        }
                        reject(respuesta);
                        // return res.json({
                        //     status: 400,
                        //     mensaje: "Error al editar el slide",
                        //     err
                        // })
                    }
                    // return res.json({
                    //     status: 200,
                    //     data,
                    //     mensaje: "El slide ha sido actualizado con exito"

                    // })
                    let respuesta = {
                        res: res,
                        data: data
                    }
                    resolve(respuesta);
                })
            })


        }
        /*=======================================
        4. SINCRONIZAMOS LAS PROMESAS
        ========================================= */
        validarCambioArchivo(req, rutaImagen).then((rutaImagen) => {
            cambiarRegistroBD(id, body, rutaImagen).then(respuesta => {
                respuesta["res"].json({
                    status: 200,
                    data: respuesta["data"],
                    mensaje: "El slide ha sido actualizado con exito"
                })
            }).catch(respuesta => {
                respuesta["err"].json({
                    status: 400,
                    err: respuesta["err"],
                    mensaje: "Error al editar el slide"
                })
            })
        }).catch(respuesta => {
            respuesta["res"].json({
                status: 400,
                mensaje: respuesta["mensaje"]
            })
        })
    });

}
/*========================
FUNCION DELETE
========================== */
let borrarSlide = (req, res) => {
    //CAPTURAMOS EL ID DEL SLIDE A ACTUALIZAR
    let id = req.params.id;
    Slide.findById(id, (err, data) => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en el servidor",
                err
            })
        }

        //Validamos que el slide exista
        if (!data) {
            return res.json({
                status: 404,
                mensaje: "No existe el slide en la base de datos",
                err
            })
        }
        //Borramos antiigua imagen
        if (fs.existsSync(`./archivos/slide/${data.imagen}`)) {
            fs.unlinkSync(`./archivos/slide/${data.imagen}`); //Que borre
        }
        //Borramos registro en mongoDB
        //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
        Slide.findByIdAndRemove(id, (err, data) => {
            if (err) {
                return res.json({
                    status: 500,
                    mensaje: "Error al borrar el slide",
                    err
                })
            }
            res.json({
                status: 200,
                mensaje: "El Slide ha sido eliminado correctamente"
            })

        })
    })
}
/*========================
MOSTRAR ARCHIVO, FUNCION GET PARA ACCESO A IMG
========================== */
let mostrarImg = (req, res) => {
    let imagen = req.params.imagen;
    let rutaImagen = `./archivos/slide/${imagen}`;
    fs.exists(rutaImagen, exists => {
        if (!exists) {
            return res.json({
                status: 400,
                mensaje: "La imagen no existe"
            })
        }
        res.sendFile(path.resolve(rutaImagen));
    })
}
/*========================
EXPORTAMOS FUNCIONES DEL CONTROLADOR
========================== */
module.exports = {
    mostrarSlide,
    crearSlide,
    editarSlide,
    borrarSlide,
    mostrarImg
}