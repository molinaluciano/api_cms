/*==================================================================
EL PROCESS ES UN OBJT GLOBAL QUE CORRE EN TODO EL ENTORNO DE DESARROLLO EN NODEJS
==================================================================== */
process.env.PORT = process.env.PORT || 4000;
/*==================================================================
CREO VARIABL SECRET PARA TOKEN
==================================================================== */
process.env.SECRET = "noquieroquesesepa";
/*==================================================================
Variable caducidad de TOKEN
==================================================================== */
process.env.CADUCIDAD = 60 * 60 * 24 * 30;