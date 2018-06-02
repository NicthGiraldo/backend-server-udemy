var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario')

var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

// ==========================================
// obtener todos los usuarios
// ==========================================
app.get('/', (req, res, next) => {
    // el "limit()" limita la cantidad de usuarios que se quieren mostrar
    // "req.query.desde || 0" con esto guardamos la variable "desde" que deberia traer el req pero,
    // decimos que si no trae nada la iguale a cero ya que siempre se necesita un numero 
    var desde = req.query.desde || 0;
    desde = Number(desde); // si el usuario digita una letra el codigo rebientaria

    // con "skip(desde)" estamos diciendo que comience desde la posicion que se ingrese en la variable desde
    Usuario.find({}, 'nombre email img role').limit(5).skip(desde).exec(
        (err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }
            // "count" cuenta todos los registros, pero se puede limitar entre las llaves
            Usuario.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: conteo
                });

            });

        });
});

// ==========================================
// actualizar un usuario
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id ' + id + ' no existe',
                errors: err
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':v' // se mostrar esto como la contraseña, pero solo es en la respuesta del guardado

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });
});

// ==========================================
// crear un nuevo usuarios 
// ==========================================
// npm install mongoose-unique-validator --save =========== para las validaciones de correo
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });

    });

});

// ==========================================
// borrar un usuario
// ==========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un usuario con ese id',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            message: 'el siguiente usuario fue borrado',
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;