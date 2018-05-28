var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario')

app.post('/', (req, res) => {

    var body = req.body;
    // {email: body.email} = condicion de busqueda
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                message: 'credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'credenciales incorrectas - password',
                errors: err
            });
        }

        // crear un token 

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id
        });
    });
});

module.exports = app;