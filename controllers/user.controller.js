const assert = require("assert");

const validation = require("../utils/validation");
const db = require("../utils/mysql-db");


const userController = {
    getAllUsers: (req, res) => {
        const query = req.query;
        const whereClauses = [];
        const params = [];

        for (const [key, value] of Object.entries(query)) {
            if (key === "isActive") {
                whereClauses.push(`isActive = ?`);
                params.push(value === "true" ? 1 : value === "false" ? 0 : value);
            } else {
                whereClauses.push(`${key} = ?`);
                params.push(value);
            }
        }

        let sql = "SELECT id, firstName, lastName, street, city, emailAdress, phoneNumber, isActive FROM user";
        if (whereClauses.length > 0) {
            sql += " WHERE " + whereClauses.join(" AND ");
        }

        db.query(sql, params, (err, rows) => {
            if (err) {
                if (err.code === "ER_BAD_FIELD_ERROR") {
                    return res.status(400).json({
                        status: "200",
                        message: "Users retrieved successfully",
                        data: {},
                    });
                }
                return res.status(500).json({
                    status: "500",
                    message: "Internal server error",
                    data: {},
                });
            }
            rows.forEach((row) => {
                row.isActive = row.isActive === 1;
            });
            return res.status(200).json({
                status: "200",
                message: "Users retrieved successfully",
                data: rows,
            });
        });
    },
    getUserById: (req, res) => {
        const userId = parseInt(req.params.userId);
        const sql = "SELECT * FROM user WHERE id = ?";
        const params = [userId];

        db.query(sql, params, (err, rows) => {
            if (err) {
                return res.status(500).json({
                    status: "500",
                    message: "Internal server error",
                    data: {},
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    status: "404",
                    message: "User not found, no user with that id",
                    data: {},
                });
            }

            rows[0].isActive = rows[0].isActive === 1;
            return res.status(200).json({
                status: "200",
                message: "Success, user with that id found",
                data: rows[0],
            });
        });
    },
    createUser: (req, res) => {
        const {
            firstName,
            lastName,
            street,
            city,
            emailAdress,
            password,
            phoneNumber
        } = req.body;

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
            return res.status(400).json({
                status: "400",
                message: err.message,
                data: {},
            });
        }

        const checkUserQuery = `SELECT * FROM user WHERE emailAdress = ?`;
        db.query(checkUserQuery, [emailAdress], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    status: "500",
                    message: "Internal server error",
                    data: {},
                });
            } else {
                if (rows.length > 0) {
                    return res.status(403).json({
                        status: "403",
                        message: "User with that emailAdress already exists, registration failed",
                        data: {},
                    });
                } else {
                    const newUserQuery = `INSERT INTO user (firstName, lastName, isActive, street, city, emailAdress, password, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                    db.query(newUserQuery, [firstName, lastName, 1, street, city, emailAdress, password, phoneNumber], (err, rows) => {
                        if (err) {
                            return res.status(500).json({
                                status: "500",
                                message: "Internal server error",
                                data: {},
                            });
                        } else {
                            return res.status(201).json({
                                status: "201",
                                message: "New user registered",
                                data: {
                                    id: rows.insertId,
                                    firstName,
                                    lastName,
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
        const userId = parseInt(req.params.userId);

        const checkUserQuery = `SELECT * FROM user WHERE id = ?`;
        db.query(checkUserQuery, [userId], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    status: "500",
                    message: "Internal server error",
                    data: {},
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    status: "404",
                    message: "User not found, edit failed",
                    data: {},
                });
            }

            const { emailAdress } = req.body;

            try {
                assert(emailAdress, "Missing required field, emailAdress, edit failed");
                assert(validation.validateEmailAdress(emailAdress), "Invalid emailAdress format, edit failed");
                if (req.body.phoneNumber) {
                    assert(validation.validatePhoneNumber(req.body.phoneNumber), "Invalid phoneNumber format, edit failed");
                }
            } catch (error) {
                switch (error.message) {
                    case "Unauthorized":
                        return res.status(401).json({ status: "401", message: error.message, data: {} });
                    case "Forbidden":
                        return res.status(403).json({ status: "403", message: error.message, data: {} });
                    default:
                        return res.status(400).json({ status: "400", message: error.message, data: {} });
                }
            }

            const updateUserQuery = `UPDATE user SET ${Object.keys(req.body).map(key => `${key} = ?`).join(", ")} WHERE id = ?`;
            db.query(updateUserQuery, [...Object.values(req.body), userId], (err) => {
                if (err) {
                    return res.status(500).json({
                        status: "500",
                        message: "Internal server error",
                        data: {},
                    });
                }

                return res.status(200).json({
                    status: "200",
                    message: "User successfully edited",
                    data: { id: userId, ...req.body },
                });
            });
        });
    },
    deleteUser: (req, res) => {

        const userId = parseInt(req.params.userId);

            const getUserQuery = `SELECT * FROM user WHERE id = ?`;
            db.query(getUserQuery, [userId], (err, rows) => {
                if (err) {
                    return res.status(500).json({
                        status: "500",
                        message: "Internal server error",
                        data: {},
                    });
                } else if (rows.length === 0) {
                    return res.status(404).json({
                        status: "404",
                        message: "User not found, delete failed",
                        data: {},
                    });
                }

                const deletedUser = rows[0];

                const deleteUserQuery = `DELETE FROM user WHERE id = ?`;
                db.query(deleteUserQuery, [userId], (err) => {
                    if (err) {
                        return res.status(500).json({
                            status: "500",
                            message: "Internal server error",
                            data: {},
                        });
                    }

                    return res.status(200).json({
                        status: "200",
                        message: "User successfully deleted",
                        data: {
                            deletedUser,
                        },
                    });
                });
            });
    },
    profile: (req, res) => {
        db.query("SELECT * FROM user WHERE id = 1", (err, rows) => {
            if (err) {
                return res.status(500).json({
                    status: "500",
                    message: "Internal server error",
                    data: {},
                });
            } else if (rows.length === 0) {
                return res.status(404).json({
                    status: "404",
                    message: "User not found",
                    data: {},
                });
            } else {
                rows[0].isActive = rows[0].isActive === 1;
                return res.status(200).json({
                    status: "200",
                    message: "Success",
                    data: rows[0],
                });
            }
        });
    }
}

module.exports = userController;