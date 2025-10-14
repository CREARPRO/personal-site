const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static('.'));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejar todas las rutas enviándolas a index.html para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});