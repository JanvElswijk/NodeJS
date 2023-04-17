const express = require('express');
const app = express();
const port = 3000;

const api = require('./api');



app.all('/', (req, res) => {
    res.send('Wrong endpoint, use /api');
    });

app.use('/api', api);

app.listen(port, () => {
    console.log('Server started on port 3000');
});