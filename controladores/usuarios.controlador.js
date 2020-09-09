/*========================
IMPORTAMOS MODELO
========================== */

const Usuarios = require('../modelos/usuarios.modelo');
//Requerimos del modulo para encriptar contraseñas
const bcrypt = require('bcrypt')

/*========================
PETICION GET
========================== */
let mostrarUsuarios = (req, res) => {
    //https://mongoosejs.com/docs/api.html#model_Model.find
    Usuarios.find({}).exec((err, data) => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en la peticion"
            })
        }
        //Contar la cantidad de registros
        Usuarios.countDocuments({}, (err, total) => {
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
let crearUsuario = (req, res) => {
    //Obtenemos el cuerpo del formulario
    let body = req.body;

    //Obtenemos los datos del formulario para pasarlo al modelo
    let usuarios = new Usuarios({
        usuario: body.usuario,
        password: bcrypt.hashSync(body.password, 10),
        email: body.email
    })
    console.log(usuarios);

    //Guardar en MongoDB
    // https://mongoosejs.com/docs/api.html#model:Model-save
    usuarios.save((err, data) => {
        if (err) {
            return res.json({
                status: 400,
                mensaje: err.message,
                err
            })
        }
        res.json({
            status: 200,
            data,
            mensaje: "El Usuario ha sido creado con exito"
        })
    })


}
/*========================
FUNCION LOGIN
========================== */
let loginUsuario = (req, res) => {
    //Obtenemos el cuerpo del formulario
    let body = req.body;
    //Recorremos la base de datos en busqueda de coincidencia con el usuario
    Usuarios.findOne({
        usuario: body.usuario
    }, (err, data) => {
        if (err) {
            return res.json({
                status: 500,
                mensaje: "Error en el servidor",
                err
            })
        }
        //Validamos que el Usuario exista
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

        res.json({
            status: 200,
            mensaje: "ok"
        })
    })
}
/*======================================
EXPORTAMOS CONTROLADOR
======================================== */
module.exports = {
    mostrarUsuarios,
    crearUsuario,
    loginUsuario
}