const { User, users } = require("../utils/in-mem-db");
const assert = require("assert");
const validation = require("../utils/validation");
const jwt = require('jsonwebtoken');
// const logger = require("../utils/logger").logger;
const jwtSecret = 'NeverGonnaGiveYouUp';
const userController = {
    getAllUsers: (req, res) => {
        const { query } = req;

        const filteredUsers = query ?
            users.filter(user =>
                Object.entries(query).every(([key, value]) =>
                    (typeof user[key] === 'boolean') ? value === user[key].toString() : value === user[key]
                )
            ) :
            users;

        const message = Object.keys(query).length ? 'Success, filters applied' : 'Success, no filters applied';

        if (filteredUsers.length === 0) {
            return res.status(200).json({
                status: '200',
                message,
                data: {} });
        }

        const sanitizedUsers = filteredUsers.map(({ password, ...rest }) => rest);
        res.status(200).json({
            status: '200',
            message,
            data: sanitizedUsers });
    },
    getUserById: (req, res) => {
        const userId = parseInt(req.params.userId);
        const user = users.find((user) => user.id === userId);

        if (!user) return res.status(404).json({status: "404", message: "User not found, no user with that id", data: {}});

        const token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || null;

        if (token !== null) {
            jwt.verify(token, jwtSecret, function (err, decoded) {
                if (err) {
                    return res.status(401).json({
                        status: "401",
                        message: "Unauthorized, invalid token",
                        data: {},
                    });
                } else {
                    if (parseInt(decoded.id) === parseInt(req.params.userId)) {
                        return res.status(200).json({
                            status: "200",
                            message: "Success, user with that id found",
                            data: user,
                        });
                    } else {
                        return res.status(401).json({
                            status: "401",
                            message: "Unauthorized",
                            data: {},
                        });
                    }
                }
            });
        } else {
            const { password, ...sanitizedUser } = user;
            return res.status(200).json({
                status: "200",
                message: "Success, user with that id found",
                data: sanitizedUser,
            });
        }

    },
    createUser: (req, res) => {
        const {
            firstName,
            lastName,
            street,
            city,
            email,
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
            assert(email, "Missing required fields for registration");
            assert(typeof email === "string", "Email is not a string, registration failed");
            assert(validation.validateEmail(email), "Email is not valid, registration failed");
            const existingUser = users.find((user) => user.email === email);
            assert(!existingUser, "User with that email already exists, registration failed");
            assert(password, "Missing required fields for registration");
            assert(typeof password === "string", "Password is not a string, registration failed");
            assert(validation.validatePassword(password), "Password is not valid, registration failed");
            assert(phoneNumber, "Missing required fields for registration");
            assert(typeof phoneNumber === "string", "Phone number is not a string, registration failed");
            assert(validation.validatePhoneNumber(phoneNumber), "Phone number is not valid, registration failed");
        } catch (err) {
            if (err.message === "User with that email already exists, registration failed") {
                return res.status(403).json({
                    status: "403",
                    message: err.message,
                    data: {},
                });
            } else {
                return res.status(400).json({
                    status: "400",
                    message: err.message,
                    data: {},
                });
            }
        }

        // Create new user
        const newUser = new User(users.length + 1, firstName, lastName, street, city, true, email, password, phoneNumber);
        users.push(newUser);

        res.status(201).json({
            status: "201",
            message: "New user registered",
            data: newUser,
        });
    },
    updateUser: (req, res) => {
        const userId = parseInt(req.params.userId);
        const editUser = users.find((user) => user.id === userId);
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        const { firstName, lastName, street, city, email, password, phoneNumber } = req.body;

        try {
            assert(editUser, "User not found, edit failed");
            assert(token, "Unauthorized");
            assert(email, "Missing required field, email, edit failed");
            assert(validation.validateEmail(email), "Invalid email format, edit failed");
            if (phoneNumber) {
                assert(validation.validatePhoneNumber(phoneNumber), "Phone number is not valid, edit failed");
            }
            assert(!users.find(user => user.email === email && user.id !== userId), "Email already exists, edit failed");

            jwt.verify(token, jwtSecret, function (err, decoded) {
                assert(!err, "Invalid token provided, edit failed");
                assert(parseInt(decoded.id) === userId, "Forbidden");
            });
        } catch (error) {
            switch (error.message) {
                case "Unauthorized":
                    return res.status(401).json({status: "401", message: error.message, data: {}});
                case "Forbidden":
                    return res.status(403).json({status: "403", message: error.message, data: {}});
                case "User not found, edit failed":
                    return res.status(404).json({status: "404", message: error.message, data: {}});
                default:
                    return res.status(400).json({status: "400", message: error.message, data: {}});
            }
        }

        editUser.firstName = firstName || editUser.firstName;
        editUser.lastName = lastName || editUser.lastName;
        editUser.street = street || editUser.street;
        editUser.city = city || editUser.city;
        editUser.email = email;
        editUser.password = password || editUser.password;
        editUser.phoneNumber = phoneNumber || editUser.phoneNumber;

        res.status(200).json({
            status: "200",
            message: "User successfully edited",
            data: editUser,
        });
    },
    deleteUser: (req, res) => {
        const userId = parseInt(req.params.userId);
        const deleteUser = users.find((user) => user.id === userId);
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

        try {
            assert(deleteUser, "User not found, delete failed");
            assert(token, "Unauthorized");
            jwt.verify(token, jwtSecret, function (err, decoded) {
                assert(!err, "Invalid token provided, delete failed");
                assert(parseInt(decoded.id) === userId, "Forbidden");
            });

            users.splice(users.indexOf(deleteUser), 1);
            return res.status(200).json({status: "200", message: "User successfully deleted", data: deleteUser});
        } catch (error) {
            switch (error.message) {
                case "Unauthorized":
                    return res.status(401).json({status: "401", message: error.message, data: {}});
                case "Forbidden":
                    return res.status(403).json({status: "403", message: error.message, data: {}});
                case "User not found, delete failed":
                    return res.status(404).json({status: "404", message: error.message, data: {}});
                default:
                    return res.status(400).json({status: "400", message: error.message, data: {}});
            }
        }
    },
    profile: (req, res) => {
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

        if (!token) {
            return res.status(401).json({
                status: "401",
                message: "Unauthorized, no token provided",
                data: {},
            });
        }

        jwt.verify(token, jwtSecret, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    status: "401",
                    message: "Unauthorized",
                    data: {},
                });
            } else {
                const userId = decoded.id;
                const user = users.find((user) => user.id === userId);

                if (!user) {
                    console.log("User not found, token invalid")
                    return res.status(404).json({
                        status: "404",
                        message: "User not found, token invalid",
                        data: {},
                    });
                }

                res.status(200).json({
                    status: "200",
                    message: "Success",
                    data: user,
                });
            }
        });
    }
}

module.exports = userController;