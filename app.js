const bodyParser = require("body-parser");
// const jwt = require("jsonwebtoken");
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const mealRoutes = require('./routes/meal.routes');
// const jwtConfig = require("./configs/jwt.config");
const logger = require('./utils/logger').logger;
// const db = require('./utils/mysql-db');
// const {users} = require("./utils/in-mem-db");

app.use(bodyParser.json());

app.use('*', (req, res, next) => {
    const method = req.method;
    logger.trace(`Methode ${method} is aangeroepen`);
    next();
});

// app.post("/api/login", (req, res) => {
//     const { emailAdress, password } = req.body;
//
//     // Check if all fields are present and not empty
//     if (!emailAdress || !password) {
//         return res.status(400).json({
//             status: "400",
//             message: "Missing required fields for login",
//             data: {},
//         });
//     }
//
//     db.query('SELECT * FROM user WHERE emailAdress = ?', [emailAdress], (err, rows) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).json({
//                 status: "500",
//                 message: "Internal Server Error",
//                 data: {},
//             });
//         }
//         if (rows.length === 0) {
//             return res.status(404).json({
//                 status: "404",
//                 message: "User not found",
//                 data: {},
//             });
//         }
//         if (rows[0].password !== password) {
//             return res.status(401).json({
//                 status: "400",
//                 message: "Unauthorized, invalid password",
//                 data: {},
//             });
//         }
//         const token = jwt.sign({ userId: rows[0].id }, jwtConfig.secret);
//         const user = rows[0];
//         res.status(200).json({
//             status: "200",
//             message: "Login successful",
//             data: {user, token},
//         });
//     });
//
// });

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

app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/meal', mealRoutes);

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