/*========================
UBICAMOS LOS REQUERIMIENTOS NECESARIOS PARA UTILIZAR EL APP
========================== */
const express = require('express');
const app = express();
/*======================================
IMPORTAMOS CONTROLADOR
======================================== */
let Usuarios = require('../controladores/usuarios.controlador');

/*======================================
CREAMOS PETICION
======================================== */
app.get('/mostrar-usuarios', Usuarios.mostrarUsuarios);
app.post('/crear-usuario', Usuarios.crearUsuario);
app.post('/login-usuario', Usuarios.loginUsuario);
/*========================
EXPORTAMOS RUTA
========================== */
module.exports = app;