const express = require('express');
const app = express();
const port = 3000;

const api = require('./api');

app.use('/api', api);

app.use((req, res) => {
    const method = req.method;
    console.log('Method ' + method + ' called')
    res.status(404).json({
        status: '404',
        message: 'Page not found',
        data: {},
    });
});

app.listen(port, () => {
    console.log('Server started on port 3000');
});

module.exports = app;