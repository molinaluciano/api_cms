/*========================
IMPORTAR MODELO
========================== */
const Galeria = require("../modelos/galeria.modelo");
/*========================
ADMINISTRACION DE CARPETAS Y ARCHIIVOS NODEJS
========================== */
const fs = require("fs");
//PErmite trabajar con la rutas del servido y viene por defecto
const path = require('path');

const {
    Promise
} = require("mongoose");
const {
    resolve
} = require("path");
const {
    rejects
} = require("assert");

/*========================
PETICION GET
========================== */
let mostrarGaleria = (req, res) => {
    //https://mongoosejs.com/docs/api.html#model_Model.find
    Galeria.find({}).exec((err, data) => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en la peticion",
            });
        }
        //Contar la cantidad de registros
        Galeria.countDocuments({}, (err, total) => {
            res.json({
                status: 200,
                total,
                data,
            });
        });
    });
};
/*========================
PETICION POST
========================== */
let crearGaleria = (req, res) => {
    //Obtendremos el cuerpo del formulario
    let body = req.body;
    //Consulta si no esta recibiendo archivo para tirar el error
    if (!req.files) {
        return res.json({
            status: 500,
            mensaje: "La imagen no puede ir vacia",
        });
    }
    //Capturamos el archivo
    let archivo = req.files.archivo;
    console.log(archivo);
    //Validamos la extension del archivo
    if (archivo.mimetype != "image/jpeg" && archivo.mimetype != "image/png") {
        return res.json({
            status: 400,
            mensaje: "La imagen debe ser formato JPG o PNG",
        });
    }
    //Validamos el tamaño
    if (archivo.size > 2000000) {
        return res.json({
            status: 400,
            mensaje: "La imagen debe ser inferior a 2MB",
        });
    }
    //Creamos nuevo nombre
    let nombre = Math.floor(Math.random() * 10000);
    console.log(nombre);
    //Capturamos la extension del archivo
    let extension = archivo.name.split(".").pop(); //Con pop logramos sacar el ultimo string despues del punto
    console.log(extension);
    //Movemos el archivo a la carpeta
    archivo.mv(`./archivos/galeria/${nombre}.${extension}`, (err) => {
        //Validamos si hubo error
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error al guardar la galeria",
                err,
            });
        }

        //Obtenemos los datos del formulario para pasarlo al modelo
        let galeria = new Galeria({
            foto: `${nombre}.${extension}`,
        });
        console.log(galeria);
        //Guardar en moongoDB
        // https://mongoosejs.com/docs/api.html#model:Model-save
        galeria.save((err, data) => {
            if (err) {
                return res.json({
                    status: 400,
                    mensaje: "Error al almacenar en la BD",
                    err,
                });
            }
            res.json({
                status: 200,
                data,
                mensaje: "La galeria ha sido creada con exito",
            });
        });
    });
};
/*========================
PETICION PUT
========================== */
let editarGaleria = (req, res) => {
    //Capturamos el id del la galeria a actualizar
    let id = req.params.id;
    //Obtenemos el cuerpo del formulario
    let body = req.body;
    /*=================================
      1. VALIDAMOS QUE LA GALERIA EXISTA
      =================================== */
    //findById es funcion propia de moongose
    //https://mongoosejs.com/docs/api.html#model_Model.findById
    Galeria.findById(id, (err, data) => {
        //Validammos que no haya error
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en el servidor",
                err
            })
        }
        //Validamos que la galeria exista
        if (!data) {
            return res.json({
                status: 404,
                mensaje: "No existe la galeria en la base de datos",
                err
            })
        }

        let rutaImagen = data.foto;
        /*==================================================
        2.CREAMOS PROMISE 1 CON LA QUE VALIDAMOS QUE HAYA CAMBIO DE IMAGEN Y DAMOS UNA NUEVA RUTA
        ==================================================== */
        let validarCambioArchivo = (req, rutaImagen) => {
            return new Promise((resolve, reject) => {
                if (req.files) {
                    //Capturamos el archivo
                    let archivo = req.files.archivo;
                    console.log(archivo);
                    //Validamos la extension del archivo
                    if (
                        archivo.mimetype != "image/jpeg" &&
                        archivo.mimetype != "image/png"
                    ) {
                        return res.json({
                            status: 400,
                            mensaje: "La imagen debe ser formato JPG o PNG",
                        });
                        let respuesta = {
                            res: res,
                            mensaje: "La imagen debe ser de formato JPG o PNG",
                        };
                        reject(respuesta);
                    }
                    //Validamos el tamaño
                    if (archivo.size > 2000000) {
                        return res.json({
                            status: 400,
                            mensaje: "La imagen debe ser inferior a 2MB",
                        });
                        let respuesta = {
                            res: res,
                            mensaje: "La imagen debe ser inferior a 2MB",
                        };
                        reject(respuesta);
                    }
                    //Creamos nuevo nombre
                    let nombre = Math.floor(Math.random() * 10000);
                    console.log(nombre);
                    //Capturamos la extension del archivo
                    let extension = archivo.name.split(".").pop(); //Con pop logramos sacar el ultimo string despues del punto
                    console.log(extension);
                    //Movemos el archivo a la carpeta
                    archivo.mv(`./archivos/galeria/${nombre}.${extension}`, (err) => {
                        //Validamos si hubo error
                        if (err) {
                            return res.json({
                                status: 500,
                                mensaje: "Error al guardar la galeria",
                                err,
                            });
                            let respuesta = {
                                res: res,
                                mensaje: "Error al guardar la imagen",
                            };
                            reject(respuesta);
                        }
                        //Borramos imagen antigua
                        if (fs.existsSync(`./archivos/galeria/${rutaImagen}`)) {
                            //Consulta si existe el archivo
                            fs.unlinkSync(`./archivos/galeria/${rutaImagen}`); //Que borre
                        }
                        //Damos valor a nueva imagen
                        rutaImagen = `${nombre}.${extension}`;
                        resolve(rutaImagen);
                    });
                } else {
                    //Sino se devuelve como entra
                    resolve(rutaImagen);
                }
            });
        };
        /*==================================================
        3. CREAMOS PROMISE 2 CON EL QUE ACTUALIZAMOS LOS REGISTROS CON PROMISES
        ==================================================== */
        let cambiarRegistroBD = (id, body, rutaImagen) => {
            return new Promise((resolve, reject) => {
                let datosGaleria = {
                    foto: rutaImagen
                };
                //Actualizamos en MongoDB
                //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
                Galeria.findByIdAndUpdate(
                    id,
                    datosGaleria, {
                        new: true, //Muestra los que se guardo y no el archivo antiguo
                        runValidators: true, //Muestra los que se guardo y no el archivo antiguo
                    },
                    (err, data) => {
                        //SI HAY ERROR
                        if (err) {
                            let respuesta = {
                                res: res,
                                error: error,
                            };
                            reject(respuesta);
                        }
                        //Si no hay error
                        let respuesta = {
                            res: res,
                            data: data,
                        };
                        resolve(respuesta);
                    }
                );
            });
        };
        /*==================================================
        4.SINCRONIZAMOS LAS PROMESAS
        ==================================================== */
        validarCambioArchivo(req, rutaImagen)
            .then((rutaImagen) => {
                cambiarRegistroBD(id, body, rutaImagen)
                    .then(respuesta => {
                        respuesta["res"].json({
                            status: 200,
                            data: respuesta["data"],
                            mensaje: "La galeria ha sido actualizada con exito",
                        })
                    })
                    .catch((respuesta) => {
                        respuesta["err"].json({
                            status: 400,
                            err: respuesta["err"],
                            mensaje: "Error al editar la galeria",
                        })
                    })
            })
            .catch((respuesta) => {
                respuesta["res"].json({
                    status: 400,
                    mensaje: respuesta["mensaje"]
                });
            });
    });
};
/*========================
FUNCION DELETE
========================== */
let borrarGaleria = (req, res) => {
    let id = req.params.id;
    Galeria.findById(id, (err, data) => {
        //Validammos que no haya error
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en el servidor",
                err
            })
        }
        //Validamos que la galeria exista
        if (!data) {
            return res.json({
                status: 404,
                mensaje: "No existe la galeria en la base de datos",
                err
            })
        }
        //Borramos imagen antigua
        if (fs.existsSync(`./archivos/galeria/${data.foto}`)) {
            //Consulta si existe el archivo
            fs.unlinkSync(`./archivos/galeria/${data.foto}`); //Que borre
        }
        Galeria.findByIdAndRemove(id, (err, data) => {
            if (err) {
                return res.json({
                    status: 500,
                    mensaje: "Error al borrar la galeria",
                    err
                })
            }
            res.json({
                status: 200,
                mensaje: "La galeria ha sido eliminada"
            })
        })

    })

}
/*========================
MOSTRAR ARCHIVO, FUNCION GET PARA ACCESO A IMG
========================== */
let mostrarImg = (req, res) => {
    let imagen = req.params.imagen;
    let rutaImagen = `./archivos/galeria/${imagen}`;
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
EXPORTAR CONTROLADOR
========================== */
module.exports = {
    mostrarGaleria,
    crearGaleria,
    editarGaleria,
    borrarGaleria,
    mostrarImg
};