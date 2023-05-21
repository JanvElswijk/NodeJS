const jwt = require("jsonwebtoken");
const assert = require('assert');

const db = require("../utils/mysql-db");
const jwtConfig = require("../configs/jwt.config");
const {secret: jwtSecret} = require("../configs/jwt.config");
const logger = require("../utils/logger").logger;

module.exports = {
    login: (req, res) => {
        // Email en wachtwoord uit de request halen
        const emailAdress = req.emailAdress;
        const password = req.password;

        // Zoeken naar de user met die email
        db.query('SELECT * FROM user WHERE emailAdress = ?', [emailAdress], (err, rows) => {
                if (err) {
                    logger.error(err);
                    return res.status(500).json({
                        status: "500",
                        message: "Internal Server Error",
                        data: {},
                    });
                }
                if (rows.length === 0) {
                    logger.warn("User not found");
                    return res.status(404).json({
                        status: "404",
                        message: "User not found",
                        data: {},
                    });
                }
                // Check of het wachtwoord overeenkomt
                if (rows[0].password !== password) {
                    logger.warn("Unauthorized, invalid password");
                    return res.status(401).json({
                        status: "400",
                        message: "Unauthorized, invalid password",
                        data: {},
                    });
                }
                // Maak een token aan en stuur deze terug
                const token = jwt.sign({ userId: rows[0].id }, jwtConfig.secret);
                const user = rows[0];
                logger.info("Login successful");
                res.status(200).json({
                    status: "200",
                    message: "Login successful",
                    data: {user, token},
                });
            });
        },
    validateLogin: (req, res, next) => {
        // Email en wachtwoord uit de body halen
        const { emailAdress, password } = req.body;

        // Validatie
        try {
            assert(emailAdress, "EmailAdress is required");
            assert(password, "Password is required");

            assert(typeof emailAdress === "string", "EmailAdress must be a string");
            assert(typeof password === "string", "Password must be a string");
        } catch (err) {
            logger.warn(err.message);
            return res.status(400).json({
                status: "400",
                message: err.message,
                data: {},
            });
        }

        // Email en wachtwoord toevoegen aan de request
        req.emailAdress = emailAdress;
        req.password = password;

        logger.info("Login validated");

        next();
    },
    validateToken: (req, res, next) => {
        // Token uit de header halen
        // Pak het deel na de spatie
        const token = req.headers.authorization

        // Validatie
        // Check of de token aanwezig is
        // Check of the token valide is met jwt.verify
        // Haal de userId uit de token en voeg deze toe aan de request

        try {
            assert(token, "Unauthorized");
            const tokenWithoutBearer = token.split(" ")[1];
            jwt.verify(tokenWithoutBearer, jwtSecret, (err, decodedToken) => {
                if (err) {
                    logger.warn(err.message);
                    throw new Error("Unauthorized");
                }
                req.userId = decodedToken.userId;
                next();
            });
        } catch (err) {
            logger.warn(err.message);
            if (err.message === "Unauthorized") {
                return res.status(401).json({
                    status: "401",
                    message: err.message,
                    data: {},
                });
            }
        }
    }
}