const mongoose = require('mongoose');
//Requiero modelo para validaciones unicas
const uniqueValidator = require('mongoose-unique-validator')
/*========================
ESQUEMA PARA EL MODELO DE USUARIOS PARA CONECTOR A MONGODB
========================== */
let Schema = mongoose.Schema;
//variable para slide
let usuariosSchema = new Schema({
    usuario: {
        type: String,
        required: [true, "El usuario es obligatorio"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"]
    },
    email: {
        type: String,
        required: [true, "El email es obligatorio"],
        unique: true
    }

});
/*==============================================
EVITAR DEVOLVER EN LA DATA EL CAMPO PASSWORD
================================================ */
usuariosSchema.methods.toJSON = function () {
    let usuario = this;
    let usuarioObjet = usuario.toObject();
    delete usuarioObjet.password;
    return usuarioObjet;
}
/*======================================================
DEVOLVER MENSAJE PERSONALIZADO PARA VALIDACIONES UNICAS
=======================================================*/
usuariosSchema.plugin(uniqueValidator, {
    message: 'El {PATH} ya esta registrado en la Base de datos'
})
/*========================
EXPORTAMOS EL MODELO
========================== */
module.exports = mongoose.model("usuarios", usuariosSchema);