const mongoose = require('mongoose');
/*========================
ESQUEMA PARA EL MODELO DE GALERIA PARA CONECTOR A MONGODB
========================== */
let Schema = mongoose.Schema;
//variable para slide
let galeriaSchema = new Schema({
    foto: {
        type: String,
        required: [true, "La imagen es obligatoria"]
    }
});
/*========================
EXPORTAMOS EL MODELO
========================== */
module.exports = mongoose.model("galerias", galeriaSchema);