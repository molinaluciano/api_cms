/*========================
IMPORTAMOS MODELO
========================== */

const Admin = require('../modelos/admin.modelo');
//Requerimos del modulo para encriptar contraseñas
const bcrypt = require('bcrypt')
//requerimos para toke
const jwt = require('jsonwebtoken')
/*========================
PETICION GET
========================== */
let mostrarAdministradores = (req, res) => {
    //https://mongoosejs.com/docs/api.html#model_Model.find
    Admin.find({}).exec((err, data) => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en la peticion"
            })
        }
        //Contar la cantidad de registros
        Admin.countDocuments({}, (err, total) => {
            res.json({
                status: 200,
                total,
                data

            })
        })
    });
}
/*========================
PETICION POST
========================== */
let crearAdministrador = (req, res) => {
    //Obtenemos el cuerpo del formulario
    let body = req.body;

    //Obtenemos los datos del formulario para pasarlo al modelo
    let admin = new Admin({
        usuario: body.usuario.toLowerCase(),
        password: bcrypt.hashSync(body.password, 10)
    })
    console.log(admin);

    //Guardar en MongoDB
    // https://mongoosejs.com/docs/api.html#model:Model-save
    admin.save((err, data) => {
        if (err) {
            return res.json({
                status: 400,
                mensaje: "Error al almacenar el administrador",
                err
            })
        }
        res.json({
            status: 200,
            data,
            mensaje: "El administrador ha sido creado con exito"
        })
    })


}
/*========================
PETICION PUT
========================== */
let editarAdministrador = (req, res) => {
    //Capturamos el id del administrador a actualizar
    let id = req.params.id;
    //Obtenemos el cuerpo del formulario
    let body = req.body;
    /*========================
    1. VALIDAMOS QUE EXISTA
    ========================== */
    Admin.findById(id, (err, data) => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en el servidor",
                err
            })
        }

        //Validamos que el administrador exista
        if (!data) {
            return res.json({
                status: 404,
                mensaje: "No existe el administrador en la base de datos",
                err
            })
        }

        let pass = data.password; //password antigua
        /*========================
        2. VALIDAMOS QUE HAYA CAMBIO 
        ========================== */
        let validarCambioPassword = (body, pass) => {
            return new Promise((resolve, reject) => {
                if (body.password == undefined) {
                    resolve(pass);
                } else {
                    pass = bcrypt.hashSync(body.password, 10); //Nueva password encriptada
                    resolve(pass);
                }
            })
        }
        console.log(pass)
        /*========================
        3. ACTUALIZAMOS LOS REGISTROS 
        ========================== */
        let cambiarRegistroBD = (id, body, pass) => {
            return new Promise((resolve, reject) => {


                let datosAdministrador = {
                    usuario: body.usuario,
                    password: pass
                }

                //Actualizamos en MongoDB
                //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
                Admin.findByIdAndUpdate(id, datosAdministrador, {
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
        validarCambioPassword(body, pass).then((pass) => {
            cambiarRegistroBD(id, body, pass).then(respuesta => {
                respuesta["res"].json({
                    status: 200,
                    data: respuesta["data"],
                    mensaje: "El Administrador ha sido actualizado con exito"
                })
            }).catch(respuesta => {
                respuesta["err"].json({
                    status: 400,
                    err: respuesta["err"],
                    mensaje: "Error al editar el Administrador"
                })
            })
        }).catch(respuesta => {
            respuesta["res"].json({
                status: 400,
                mensaje: respuesta["mensaje"]
            })
        })
    })
}
/*========================
PETICION DELETE
========================== */
let borrarAdministrador = (req, res) => {
    //Capturamos el id del administrador a actualizar
    let id = req.params.id;
    /*======================================
    0. EVITAR BORRAR UNICO ADMINISTRADOR
    ======================================= */
    //https://mongoosejs.com/docs/api.html#model_Model.find
    Admin.find({}).exec((err, data) => {
       
        //Contar la cantidad de registros
        Admin.countDocuments({}, (err, total) => {
            if (Number(total) == 1) {
                return res.json({
                    status: 400,
                    mensaje: "No se puede borrar el unico administrador que existe"
                })
            }
        
        /*============================================
        1. VALIDAMOS QUE EL ADMINISTRADOR SI EXISTA
        ============================================== */
        Admin.findById(id, (err, data) => {
            if (err) {
                return res.json({
                    status: 500,
                    mensaje: "Error en el servidor",
                    err
                })
            }

            //Validamos que el administrador exista
            if (!data) {
                return res.json({
                    status: 404,
                    mensaje: "No existe el administrador en la base de datos",
                    err
                })
            }
            /*============================================
            2. BORRAR REGISTRO
            ============================================== */
            //Borramos registro en mongoDB
            //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
            Admin.findByIdAndRemove(id, (err, data) => {
                if (err) {
                    return res.json({
                        status: 500,
                        mensaje: "Error al borrar al administrador",
                        err
                    })
                }
                res.json({
                    status: 200,
                    mensaje: "El administrador ha sido eliminado correctamente"
                })

            })
        })
    })
  })
}
/*========================
FUNCION LOGIN
========================== */
let login = (req, res) => {
    //Obtenemos el cuerpo del formulario
    let body = req.body;
    //Recorremos la base de datos en busqueda de coincidencia con el usuario
    Admin.findOne({
        usuario: body.usuario
    }, (err, data) => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en el servidor",
                err
            })
        }
        //Validamos que el administrador exista
        if (!data) {
            return res.json({
                status: 400,
                mensaje: "El usuario no existe en la Base de datos",
                err
            })
        }
        //Validamos que la contraseña sea correcta
        if (!bcrypt.compareSync(body.password, data.password)) {
            return res.json({
                status: 400,
                mensaje: "La contraseña es incorrecta",
                err
            })
        }
        //Generamos TOKEN de autorizacion, que dure 30 dias
        let token = jwt.sign({
            data
        }, process.env.SECRET, {
            expiresIn: process.env.CADUCIDAD
        })
        res.json({
            status: 200,
            token,
            data
        })
    })
}
/*======================================
EXPORTAMOS CONTROLADOR
======================================== */
module.exports = {
    mostrarAdministradores,
    crearAdministrador,
    editarAdministrador,
    borrarAdministrador,
    login
}