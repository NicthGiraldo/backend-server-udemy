var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// buscar todo 
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var exRe = new RegExp(busqueda, 'i');
    // "RegExp"= expresion regular... es un metodo puramente de javascript
    // y funciona para que la busqueda no se limite a exactamente las palabras ingresadas, asi la busqueda
    //se realizara sin tener en cuenta las mayusculas o minusculas


    // ".all" es una funsion propia que permite crear un array de promesas, y dar multiple respuestas
    // simultaneamente, las respuestas de las promesas llegan en forma de array asi que se buscan y 
    // enumeran con su indice, en el mismo orden en que se llamaron las promesas 

    Promise.all([
            buscarHospitales(busqueda, exRe),
            buscarMedicos(busqueda, exRe),
            buscarUsuarios(busqueda, exRe)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })

});

function buscarHospitales(busqueda, exRe) {
    // se crea y retorna una promesa 
    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: exRe })
            .populate('usuario', 'nombre email')
            .exec(
                (err, hospitales) => {
                    if (err) {
                        reject('error al cargar los hospitales', err);
                    } else {
                        resolve(hospitales);
                    }
                });

    });
}

function buscarMedicos(busqueda, exRe) {
    // se crea y retorna una promesa 
    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: exRe })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec(
                (err, medicos) => {
                    if (err) {
                        reject('error al cargar los medicos', err);
                    } else {
                        resolve(medicos);
                    }
                });

    });
}

function buscarUsuarios(busqueda, exRe) {
    // se crea y retorna una promesa 
    return new Promise((resolve, reject) => {
        // el metodo "or" de mongo se usa para limitar la busqueda en la coleccion, en este caso
        // se busca en la coleccion Usuario solamente los que coinsidan con el nombre y el email
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': exRe }, { 'email': exRe }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            })

    });
}

module.exports = app;