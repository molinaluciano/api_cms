const mongoose = require('mongoose');
/*========================
ESQUEMA PARA EL MODELO DE SLIDE PARA CONECTOR A MONGODB
========================== */
let Schema = mongoose.Schema;
//variable para slide
let slideSchema = new Schema({
    imagen: {
        type: String,
        required: [true, "La imagen es obligatoria"]
    },
    titulo: {
        type: String,
        required: false
    },
    descripcion: {
        type: String,
        required: false
    }
});
/*========================
EXPORTAMOS EL MODELO
========================== */
module.exports = mongoose.model("slides", slideSchema);