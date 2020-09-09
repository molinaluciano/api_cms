/*========================
UBICAMOS LOS REQUERIMIENTOS NECESARIOS PARA UTILIZAR EL APP
========================== */
const express = require('express');
const app = express();
/*======================================
IMPORTAMOS CONTROLADOR
======================================== */
let Admin = require('../controladores/admin.controlador');
/*========================
IMPORTAMOS EL MIDDLEWARE
========================== */
const {
    verificarToken
} = require('../middlewares/autenticacion');
/*======================================
CREAMOS PETICION
======================================== */
app.get('/mostrar-administradores', verificarToken, Admin.mostrarAdministradores);
app.post('/crear-administrador', verificarToken, Admin.crearAdministrador);
app.put('/editar-administrador/:id', verificarToken, Admin.editarAdministrador);
app.delete('/borrar-administrador/:id', verificarToken, Admin.borrarAdministrador);
app.post('/login', Admin.login);
/*========================
EXPORTAMOS RUTA
========================== */
module.exports = app;