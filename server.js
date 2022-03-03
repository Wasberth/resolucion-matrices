// LIBRARIES
const express = require('express');
const app = express();
const server = require('http').Server(app);

// OTHER JS FILES
const matrixHandler = require('./matrix-handler');
const solver = require('./solver');

// ENCODERS & MIDDLEWARE
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

// PORT FOR LISTENING
const port = process.env.PORT || 3000;
//const port = 25565;

// FROM POST METHOD CALCULATE
app.post('/calculate', (req, res) => {
    /*let num1 = req.body.numero1;
    let num2 = req.body.numero2;*/

    let m = matrixHandler.CreateIfValid(req.body);
    if (!m.isCorrect) { res.redirect('/'); return; }

    m.appendStep();
    m.simplify();
    solver.diagonalize(m);

    res.send(m.getHtml());
});

// SERVER STARTUP
server.listen(port, function() {
    console.log(`Servidor corriendo en el puerto ${port}`);
});