const express = require('express');
const app = express();
const port = 3000;

const api = require('./api');



app.all('/', (req, res) => {
    console.log('(/) not a usable endpoint')
    res.status(404).send('The requested resource could not be found. Please use /api endpoints.');
    });

app.use('/api', api);

app.listen(port, () => {
    console.log('Server started on port 3000');
});