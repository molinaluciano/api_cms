/*======================================
IMPORTAMOS MODELO
======================================== */
const Articulo = require('../modelos/articulos.modelo');
/*========================
ADMINISTRACION DE CARPETAS Y ARCHIIVOS NODEJS
========================== */
const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
//PErmite trabajar con la rutas del servido y viene por defecto
const path = require('path');
const {
    Promise
} = require('mongoose');

/*========================
PETICION GET
========================== */
let mostrarArticulo = (req, res) => {
    //https://mongoosejs.com/docs/api.html#model_Model.find
    Articulo.find({}).exec((err, data) => {
        if (err) {
            return res.json({
                status: 400,
                mensaje: "Error en la peticion"
            })
        }
        //Contar la cantidad de registros
        Articulo.countDocuments({}, (err, total) => {
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
let crearArticulo = (req, res) => {
    //Obtenemos el cuerpo del formulario
    let body = req.body;
    //Consulta si esta vacio
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
    //Crear carpeta con nombre de url
    let crearCarpeta = mkdirp.sync(`./archivos/articulos/${body.url}`);
    //Movemos el archivo a la carpeta
    archivo.mv(`./archivos/articulos/${body.url}/${nombre}.${extension}`, err => {
        if (err) {
            return res.json({
                status: 400,
                mensaje: "Error al guardar la imagen",
                err
            })
        }

        //Obtenemos los datos del formulario para pasarlo al modelo
        let articulo = new Articulo({
            portada: `${nombre}.${extension}`,
            titulo: body.titulo,
            intro: body.intro,
            url: body.url,
            contenido: body.contenido

        })
        console.log(articulo);

        //Guardar en MongoDB
        // https://mongoosejs.com/docs/api.html#model:Model-save
        articulo.save((err, data) => {
            if (err) {
                return res.json({
                    status: 400,
                    mensaje: "Error al almacenar el articulo",
                    err
                })
            }
            res.json({
                status: 200,
                data,
                mensaje: "El articulo ha sido creado con exito"
            })
        })

    })
}
/*========================
PETICION PUT
========================== */
let editarArticulo = (req, res) => {
    console.log("En editar")
    //Capturamos id
    let id = req.params.id;
    //Obtenemos el cuerpo del formulario
    let body = req.body;
    /*========================
    1. VALIDAMOS QUE EL SLIDE SI EXISTA
    ========================== */
    //findById es funcion propia de mongoose
    //https://mongoosejs.com/docs/api.html#model_Model.findById
    Articulo.findById(id, (err, data) => {
        if (err) {
            return res.json({
                status: 400,
                mensaje: "Error en el servidor",
                err
            })
        }

        //Validamos que el slide exista
        if (!data) {
            return res.json({
                status: 404,
                mensaje: "No existe el articulo en la base de datos",
                err
            })
        }

        let rutaImagen = data.portada;
        /*========================
        2. VALIDAMOS QUE HAYA CAMBIO DE IMAGEN con promise
        ========================== */
        let validarCambioArchivo = (req, body, rutaImagen) => {
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
                    archivo.mv(`./archivos/articulos/${body.url}/${nombre}.${extension}`, err => {
                        if (err) {
                            return res.json({
                                status: 400,
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
                        if (fs.existsSync(`./archivos/articulos/${body.url}/${rutaImagen}`)) {
                            fs.unlinkSync(`./archivos/articulos/${body.url}/${rutaImagen}`); //Que borre
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


                let datosArticulo = {
                    portada: rutaImagen,
                    titulo: body.titulo,
                    intro: body.intro,
                    url: body.url,
                    contenido: body.contenido
                }
                //Actualizamos en MongoDB
                //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
                Articulo.findByIdAndUpdate(id, datosArticulo, {
                    new: true, // Con esto me muestra lo que se guardo y no el antiguo
                    runValidators: true // Con esto me muestra lo que se guardo y no el antiguo
                }, (err, data) => {
                    if (err) {
                        let respuesta = {
                            res: res,
                            error: error
                        }
                        reject(respuesta);

                    }

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
        validarCambioArchivo(req, body, rutaImagen).then((rutaImagen) => {
            cambiarRegistroBD(id, body, rutaImagen).then(respuesta => {
                respuesta["res"].json({
                    status: 200,
                    data: respuesta["data"],
                    mensaje: "El Articulo ha sido actualizado con exito"
                })
            }).catch(respuesta => {
                respuesta["err"].json({
                    status: 400,
                    err: respuesta["err"],
                    mensaje: "Error al editar el articulo"
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
let borrarArticulo = (req, res) => {
    //Capturamos id
    let id = req.params.id;
    //findById es funcion propia de mongoose
    //https://mongoosejs.com/docs/api.html#model_Model.findById
    Articulo.findById(id, (err, data) => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en el servidor",
                err
            })
        }

        //Validamos que el articulo exista
        if (!data) {
            return res.json({
                status: 404,
                mensaje: "No existe el articulo en la base de datos",
                err
            })
        }

        let rutaImagen = data.portada;


        //Borramos la carpeta del articulo
        let rutaCarpeta = `./archivos/articulos/${data.url}`
        rimraf.sync(rutaCarpeta);
        //Borramos registro en mongoDB
        //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
        Articulo.findByIdAndRemove(id, (err, data) => {
            if (err) {
                return res.json({
                    status: 500,
                    mensaje: "Error al borrar al borrar articulo",
                    err
                })
            }
            res.json({
                status: 200,
                mensaje: "El articulo ha sido eliminado correctamente"
            })

        })



    });
}
/*========================
MOSTRAR ARCHIVO, FUNCION GET PARA ACCESO A IMG
========================== */
let mostrarImg = (req, res) => {
    let imagen = req.params.imagen.split('+');
    let rutaImagen = `./archivos/articulos/${imagen[0]}/${imagen[1]}`;
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
/*======================================
EXPORTAMOS CONTROLADOR
======================================== */
module.exports = {
    mostrarArticulo,
    crearArticulo,
    editarArticulo,
    borrarArticulo,
    mostrarImg
}