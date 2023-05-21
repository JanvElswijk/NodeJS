
const jwt = require('jsonwebtoken');
const assert = require("assert");

const validation = require("../utils/validation");
const db = require("../utils/mysql-db");
const logger = require("../utils/logger").logger;
const jwtSecret = require("../configs/jwt.config").secret;


const userController = {
    getAllUsers: (req, res) => {
        // Eventuele filters uit de query halen
        const filters = [];
        const params = [];
        const { query } = req;

        // True of false omzetten naar 1 of 0
        for (const [key, value] of Object.entries(query)) {
            if (key === 'isActive') {
                filters.push('isActive = ?');
                params.push(value === 'true' ? 1 : value === 'false' ? 0 : value);
            } else {
                filters.push(`${key} = ?`);
                params.push(value);
            }
        }

        // Query opbouwen
        let sql = 'SELECT id, firstName, lastName, street, city, emailAdress, phoneNumber, isActive FROM user';
        if (filters.length > 0) {
            sql += ' WHERE ' + filters.join(' AND ');
        }

        // Query uitvoeren, users ophalen (met eventuele filters) en terugsturen
        db.query(sql, params, (err, rows) => {
            if (err) {
                // Als de kolom niet bestaat, dan is er een filter gebruikt die niet bestaat
                // Dus niks teruggeven
                if (err.code === 'ER_BAD_FIELD_ERROR') {
                    logger.warn(err.message);
                    return res.status(400).json({
                        status: 200,
                        message: 'Users retrieved successfully, no filters applied',
                        data: [],
                    });
                }
                logger.error(err.message);
                return res.status(500).json({
                    status: 500,
                    message: 'Internal server error',
                    data: [],
                });
            }

            // 1 of 0 weer terug omzetten naar true of false
            rows.forEach((row) => {
                row.isActive = row.isActive === 1;
            });

            logger.info('Users retrieved successfully');
            return res.status(200).json({
                status: 200,
                message: 'Users retrieved successfully',
                data: rows,
            });
        });
    },
    getUserById: (req, res) => {
        // Als er een token is kijken of de gebruiker dan de eigenaar is
        // Anders alleen de publieke gegevens teruggeven
        const userId = req.params.userId;
        let tokenUserId = null;

        if (req.headers.authorization) {
            try {
                const decoded = jwt.verify(req.headers.authorization.split(" ")[1], jwtSecret);
                tokenUserId = decoded.userId;
            } catch (err) {
                logger.warn(err.message);
                return res.status(401).json({
                    status: 401,
                    message: "Unauthorized, invalid token",
                    data: {},
                });
            }
        }


        const sql = parseInt(tokenUserId) === parseInt(userId) ? 'SELECT * FROM user WHERE id = ?' : 'SELECT id, firstName, lastName, street, city, emailAdress, phoneNumber, isActive FROM user WHERE id = ?';
        const params = [userId];

        db.query(sql, params, (err, rows) => {
            if (err) {
                logger.error(err.message);
                return res.status(500).json({
                    status: 500,
                    message: "Internal Server Error",
                    data: {},
                });
            }
            if (rows.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found, no user with that id",
                    data: {},
                });
            }
            logger.info("User retrieved successfully");
            rows[0].isActive = rows[0].isActive === 1;
            return res.status(200).json({
                status: 200,
                message: "Success, user with that id found",
                data: rows[0],
            });
        });
    },
    createUser: (req, res) => {
        // Gegevens uit request halen
        const {
            firstName,
            lastName,
            street,
            city,
            emailAdress,
            password,
            phoneNumber
        } = req.body;

        // Validatie
        try {
            assert(firstName, "Missing required fields for registration");
            assert(typeof firstName === "string", "First name is not a string, registration failed");
            assert(lastName, "Missing required fields for registration");
            assert(typeof lastName === "string", "Last name is not a string, registration failed");
            assert(street, "Missing required fields for registration");
            assert(typeof street === "string", "Street is not a string, registration failed");
            assert(city, "Missing required fields for registration");
            assert(typeof city === "string", "City is not a string, registration failed");
            assert(emailAdress, "Missing required fields for registration");
            assert(typeof emailAdress === "string", "emailAdress is not a string, registration failed");
            assert(validation.validateEmailAdress(emailAdress), "emailAdress is not valid, registration failed");
            assert(password, "Missing required fields for registration");
            assert(typeof password === "string", "Password is not a string, registration failed");
            assert(validation.validatePassword(password), "Password is not valid, registration failed");
            assert(phoneNumber, "Missing required fields for registration");
            assert(typeof phoneNumber === "string", "Phone number is not a string, registration failed");
            assert(validation.validatePhoneNumber(phoneNumber), "Phone number is not valid, registration failed");
        } catch (err) {
            logger.warn(err.message)
            return res.status(400).json({
                status: 400,
                message: err.message,
                data: {},
            });
        }

        // Check of user al bestaat
        const checkUserQuery = `SELECT * FROM user WHERE emailAdress = ?`;
        db.query(checkUserQuery, [emailAdress], (err, rows) => {
            if (err) {
                logger.error(err.message)
                return res.status(500).json({
                    status: 500,
                    message: "Internal server error",
                    data: {},
                });
            } else {
                if (rows.length > 0) {
                    logger.warn("User with that emailAdress already exists, registration failed")
                    return res.status(403).json({
                        status: 403,
                        message: "User with that emailAdress already exists, registration failed",
                        data: {},
                    });
                } else {
                    // User toevoegen aan database
                    const newUserQuery = `INSERT INTO user (firstName, lastName, isActive, street, city, emailAdress, password, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                    db.query(newUserQuery, [firstName, lastName, 1, street, city, emailAdress, password, phoneNumber], (err, rows) => {
                        if (err) {
                            logger.error(err.message)
                            return res.status(500).json({
                                status: 500,
                                message: "Internal server error",
                                data: {},
                            });
                        } else {
                            logger.info("New user registered")
                            return res.status(201).json({
                                status: 201,
                                message: "New user registered",
                                data: {
                                    id: rows.insertId,
                                    firstName,
                                    lastName,
                                    isActive: true,
                                    street,
                                    city,
                                    emailAdress,
                                    password,
                                    phoneNumber,
                                },
                            });
                        }
                    });
                }
            }
        });
    },
    updateUser: (req, res) => {
        // Id uit params en req vergelijken
        const tokenUserId = parseInt(req.userId);
        const userId = parseInt(req.params.userId);

        // Kijken of de user met dat id bestaat
        const checkUserQuery = `SELECT * FROM user WHERE id = ?`;
        db.query(checkUserQuery, [userId], (err, rows) => {
            if (err) {
                logger.error(err.message)
                return res.status(500).json({
                    status: 500,
                    message: "Internal server error",
                    data: {},
                });
            }

            if (rows.length === 0) {
                logger.warn("User with id" + userId + "not found, edit failed")
                return res.status(404).json({
                    status: 404,
                    message: `User with id ${userId} not found, edit failed`,
                    data: {},
                });
            }

            if (tokenUserId !== userId) {
                logger.warn("Unauthorized, edit failed")
                return res.status(401).json({
                    status: 403,
                    message: "Forbidden",
                    data: {},
                });
            }


            // Zorgen dat de input valid is, en email nog niet bestaat
            const { emailAdress } = req.body;

            try {
                assert(emailAdress, "Missing required field, emailAdress, edit failed");
                assert(validation.validateEmailAdress(emailAdress), "Invalid emailAdress format, edit failed");
                if (req.body.phoneNumber) {
                    assert(validation.validatePhoneNumber(req.body.phoneNumber), "Invalid phoneNumber format, edit failed");
                }
            } catch (error) {
                logger.warn(error.message)
                return res.status(400).json({
                    status: 400,
                    message: error.message,
                    data: {}
                });
            }

            // User updaten
            const updateUserQuery = `UPDATE user SET ${Object.keys(req.body).map(key => `${key} = ?`).join(", ")} WHERE id = ?`;
            db.query(updateUserQuery, [...Object.values(req.body), userId], (err) => {
                if (err) {
                    logger.error(err.message)
                    return res.status(500).json({
                        status: 500,
                        message: "Internal server error",
                        data: {},
                    });
                }

                logger.info("User successfully edited")
                return res.status(200).json({
                    status: 200,
                    message: "User successfully edited",
                    data: { id: userId, ...req.body },
                });
            });
        });
    },
    deleteUser: (req, res) => {
        // Id uit params en req vergelijken
        const tokenUserId = parseInt(req.userId);
        const userId = parseInt(req.params.userId);

        if (tokenUserId !== userId) {
            logger.warn("Unauthorized, delete failed")
            return res.status(401).json({
                status: 403,
                message: "Forbidden",
                data: {},
            });
        }

        // User verwijderen, als deze niet bestaat dan 404
        const deleteUserQuery = `DELETE FROM user WHERE id = ?`;
        db.query(deleteUserQuery, [userId], (err, rows) => {
            if (err) {
                logger.error(err.message + "userId" + userId)
                return res.status(500).json({
                    status: 500,
                    message: "Internal server error",
                    data: {},
                });
            }

            if (rows.affectedRows === 0) {
                logger.warn("User with id" + userId + "not found, delete failed")
                return res.status(404).json({
                    status: 404,
                    message: `User with id ${userId} not found, delete failed`,
                    data: {},
                });
            }

            logger.info("User successfully deleted")
            return res.status(200).json({
                status: 200,
                message: `Gebruiker met ID ${userId} is verwijderd`,
                data: {},
            });
        });
    },
    profile: (req, res) => {
        // Token uit req halen (door auth middleware)
        const tokenUserId = parseInt(req.userId);

        // Checken of user bestaat
        const checkUserQuery = `SELECT * FROM user WHERE id = ?`;
        db.query(checkUserQuery, [tokenUserId], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    message: "Internal server error",
                    data: {},
                });
            }

            // Als user niet bestaat dan 404 User not found, token invalid (want dan was de userId van de token niet geldig)
            if (rows.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found, token invalid",
                    data: {},
                });
            }

            // Als user wel bestaat dan 200 Success
            rows[0].isActive = rows[0].isActive === 1; // Dit is omdat de database boolean weergeeft als 1 of 0 ipv true of false
            return res.status(200).json({
                status: 200,
                message: "Success",
                data: rows[0],
            });
        });
    }
}

module.exports = userController;