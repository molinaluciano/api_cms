const mongoose = require('mongoose');
/*========================
ESQUEMA PARA EL MODELO DE ADMINISTRADOR PARA CONECTOR A MONGODB
========================== */
let Schema = mongoose.Schema;
//variable para slide
let adminSchema = new Schema({
    usuario: {
        type: String,
        required: [true, "El usuario es obligatorio"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"]
    }

});
/*==============================================
EVITAR DEVOLVER EN LA DATA EL CAMPO PASSWORD
================================================ */
adminSchema.methods.toJSON = function () {
    let admin = this;
    let adminObjet = admin.toObject();
    delete adminObjet.password;
    return adminObjet;
}
/*========================
EXPORTAMOS EL MODELO
========================== */
module.exports = mongoose.model("administradores", adminSchema);