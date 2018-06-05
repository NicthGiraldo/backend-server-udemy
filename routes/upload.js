var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();

app.use(fileUpload());

// rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion validas
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'tipo de coleccion no valida',
            errors: { message: 'tipo de coleccion no valida' }
        });
    }

    // si mandan ningun archivo
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'no selecciono ningun archivo',
            errors: { message: 'debe seleccionar una imagen' }
        });
    }

    // obtener el nombre del archivo
    var archivo = req.files.imagen; // se trae la imagen por medio de files
    var nombreSeccionado = archivo.name.split('.'); // divide el nombre por medio de los puntos
    var extensionArchivo = nombreSeccionado[nombreSeccionado.length - 1]; // se selecciona la ultima posicion del array "nombreSeccionado"

    // extensiones validas 
    var extValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // se busca coinsidencia en el array "extValidas" con "extensionArchivo" extraido con split
    if (extValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extension no valida',
            errors: { message: 'las extensiones validas son ' + extValidas.join(', ') }
        });
    }

    // nombre personalizado 
    // se extrae los milisegundos de la fecha para formar el nombre
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // mover el archivo del temporal a un path en especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'archivo movido',
            extensionArchivo: extensionArchivo
        });
    });
});

module.exports = app