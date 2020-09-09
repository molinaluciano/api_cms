/*========================
UBICAMOS LOS REQUERIMIENTOS NECESARIOS PARA UTILIZAR EL APP
========================== */
const express = require('express');
const app = express();

/*======================================
IMPORTAMOS CONTROLADOR
======================================== */
let Articulo = require('../controladores/articulos.controlador');
/*========================
IMPORTAMOS EL MIDDLEWARE
========================== */
const {
    verificarToken
} = require('../middlewares/autenticacion');
/*========================
CREAMOS RUTAS HTTP
========================== */
app.get('/mostrar-articulos', Articulo.mostrarArticulo);
app.post('/crear-articulo', verificarToken, Articulo.crearArticulo);
app.put('/editar-articulo/:id', verificarToken, Articulo.editarArticulo);
app.delete('/borrar-articulo/:id', verificarToken, Articulo.borrarArticulo);
app.get('/mostrar-img-articulo/:imagen', Articulo.mostrarImg);

/*======================================
EXPORTAMOS RUTAS
======================================== */
module.exports = app;