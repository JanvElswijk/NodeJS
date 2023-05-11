const bodyParser = require("body-parser");
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const userRoutes = require('./routes/user.routes');
const logger = require('./utils/logger').logger;

app.use(bodyParser.json());

app.use('*', (req, res, next) => {
    const method = req.method;
    logger.trace(`Methode ${method} is aangeroepen`);
    next();
});

app.get("/api/info", (req, res) => {
    res.status(200).json({
        status: "200",
        message: "Server info endpoint",
        data: {
            studentName: "Jan van Elswijk",
            studentNumber: "2200971",
            description: "Dit is een express server voor het vak Programmeren 4",
        },
    });
});

app.use('/api/user', userRoutes);

app.use('*', (req, res) => {
    logger.warn('Invalid endpoint called: ', req.path);
    res.status(404).json({
        status: 404,
        message: 'Endpoint not found',
        data: {}
    });
});


app.listen(port, () => {
    console.log('Server started on port 3000');
});

module.exports = app;