const mongoose = require('mongoose');
/*========================
ESQUEMA PARA EL MODELO DE ARTICULOS PARA CONECTOR A MONGODB
========================== */
let Schema = mongoose.Schema;
//variable para slide
let articuloSchema = new Schema({
    portada: {
        type: String,
        required: [true, "La portada es obligatoria"]
    },
    titulo: {
        type: String,
        required: [true, "El titulo es obligatorio"]
    },
    intro: {
        type: String,
        required: [true, "La intro es obligatoria"]
    },
    url: {
        type: String,
        required: [true, "La url es obligatoria"]
    },
    contenido: {
        type: String,
        required: [true, "El contenido es obligatoria"]
    }
});
/*========================
EXPORTAMOS EL MODELO
========================== */
module.exports = mongoose.model("articulos", articuloSchema);