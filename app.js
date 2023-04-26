const express = require('express');
const app = express();
const port = 3000;

const userRoutes = require('./routes/user.routes');
const logger = require('./utils/logger').logger;

const {users} = require("./utils/in-mem-db");
const jwt = require("jsonwebtoken");
const jwtConfig = require("./configs/jwt.config");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use('*', (req, res, next) => {
    const method = req.method;
    logger.trace(`Methode ${method} is aangeroepen`);
    next();
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    // Check if all fields are present and not empty
    if (!email || !password) {
        return res.status(400).json({
            status: "400",
            message: "Missing required fields for login",
            data: {},
        });
    }

    // Check if email and password are correct
    const user = users.find((user) => user.email === email && user.password === password);
    if (!user) {
        return res.status(401).json({
            status: "401",
            message: "Unauthorized, invalid email or password",
            data: {},
        });
    }

    // Create token
    const token = jwt.sign({ userId: user.id }, jwtConfig.secret);

    res.status(200).json({
        status: "200",
        message: "User logged in",
        data: {user, token},
    });
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