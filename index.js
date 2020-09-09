/*========================
UBICAMOS LOS REQUERIMIENTOS
========================== */
require('./config');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

/*============================================================================
CREAMOS UNA VARIABLE PARA TENER TODAS LAS FUNCIONALIDADES DE EXPRESS
==============================================================================*/
const app = express();
/*========================
MIDDLERWARE PARA BODY PARSER
========================== */
//pase application/x-www-forn-urlencoded
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));
//parse application/json
app.use(bodyParser.json({
    limit: '10mb',
    extended: true
}));
/*========================
MIDDLERWARE PARA FILE UPLOAD
========================== */
app.use(fileUpload());
/*========================
EJECUTANDO CORS
========================== */
app.use(cors());
/*========================
MOONGOSE DEPRECATIONS
========================== */
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
/*========================
IMPORTAMOS RUTAS
========================== */
app.use(require('./rutas/slide.ruta'));
app.use(require('./rutas/galeria.ruta'));
app.use(require('./rutas/articulos.ruta'));
app.use(require('./rutas/admin.ruta'));
app.use(require('./rutas/usuarios.ruta'));

/*========================
CONEXION A LA BASE DE DATOS
========================== */
mongoose.connect('mongodb://localhost:27017/apirest', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, res) => {
    if (err) throw err;
    console.log("CONTECTADO A LA BASE DE DATOS");
});
/*========================
SALIDA PUERTO HTTP
========================== */
app.listen(process.env.PORT, () => {
    console.log(`Habilitado el puerto ${process.env.PORT} `)
})