const express = require("express");
const router = express.Router();
const { User, users } = require("./user");
const crypto = require('crypto');

const bodyParser = require("body-parser");
const validation = require("./validation");


const checkAuth = (token) => {
    return users.find((user) => user.token === token);

}

router.use(bodyParser.json());

// UC-101 /api/login
router.post("/login", (req, res) => {
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

    res.status(200).json({
        status: "200",
        message: "User logged in",
        data: user,
    });
});

// UC-102 /api/info
router.get("/info", (req, res) => {
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


// UC-201 /api/register
router.post("/register", (req, res) => {
    const {
        firstName,
        lastName,
        street,
        city,
        email,
        password,
        phoneNumber
    } = req.body;

    if (
        !firstName ||
        !lastName ||
        !street ||
        !city ||
        !email ||
        !password ||
        !phoneNumber
    ) {
        return res.status(400).json({
            status: "400",
            message: "Missing required fields for registration",
            data: {},
        });
    }

    if (!validation.validateEmail(email)) {
        return res.status(400).json({
            status: "400",
            message: "Email is not valid, registration failed",
            data: {},
        });
    }

    if (!validation.validatePassword(password)) {
        return res.status(400).json({
            status: "400",
            message: "Password is not valid, registration failed",
            data: {},
        });
    }

    if (!validation.validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({
            status: "400",
            message: "Phone number is not valid, registration failed",
            data: {},
        });
    }

    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
        return res.status(403).json({
            status: "403",
            message: "Email already exists, registration failed",
            data: {},
        });
    }

    // Create new user
    const newUser = new User(null, users.length + 1, firstName, lastName, street, city, true, email, password, phoneNumber);
    newUser.token = crypto.createHash('sha256')
        .update(JSON.stringify(newUser))
        .digest('hex');

    users.push(newUser);

    res.status(201).json({
        status: "201",
        message: "New user registered",
        data: newUser,
    });
});

// UC-202 /api/user
// UC-202 /api/user?field1=:value1&field2=:value
router.get("/user", (req, res) => {
    const { query } = req;

    if (Object.keys(query).length === 0) {
        const sanitizedUsers = users.map(({ password, ...rest }) => ({ ...rest }));

        res.status(200).json({
            status: "200",
            message: "Success, no filters applied",
            data: sanitizedUsers,
        });
    } else {
        const filterUsers = (users, filters) => {
            return users.filter((user) => {
                for (const key in filters) {
                    const queryValue = filters[key];
                    const userValue = user[key];

                    if (typeof userValue === "boolean") {
                        if (queryValue !== userValue.toString()) {
                            return false;
                        }
                    } else {
                        if (queryValue !== userValue) {
                            return false;
                        }
                    }
                }
                return true;
            });
        };
        const filteredUsers = filterUsers(users, query);

        if (filteredUsers.length === 0) {
            res.status(200).json({
                status: "200",
                message: "Success, filters applied",
                data: {},
            });
        } else {
            const sanitizedFilteredUsers = filteredUsers.map(({ password, ...rest }) => ({ ...rest }));
            res.status(200).json({
                status: "200",
                message: "Success, filters applied",
                data: sanitizedFilteredUsers,
            });
        }
    }
});

// UC-203 /api/user/profile
router.get("/user/profile", (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: "401",
            message: "Unauthorized, no token provided",
            data: {},
        });
    } else if (!checkAuth(token)) {
        return res.status(401).json({
            status: "401",
            message: "Unauthorized",
            data: {},
        });
    }

    const user = users.find((user) => user.token === token);

    res.status(200).json({
        status: "200",
        message: "Success, user profile found",
        data: user,
    });
});

router.route("/user/:userId")
    .all((req, res, next) => {
        if (!req.headers.authorization) {
            next();
        } else if (!checkAuth(req.headers.authorization.split(' ')[1])) {
            return res.status(401).json({
                status: "401",
                message: "Unauthorized, invalid token",
                data: {},
            });
        } else {
            next();
        }
    })
    .get((req, res) => {
        const userId = parseInt(req.params.userId);
        const user = users.find((user) => user.id === userId);
        let userAuth = false;
        if (req.headers.authorization) {
            const authToken = req.headers.authorization.split(' ')[1];
            userAuth = users.find((user) => user.token === authToken);
        }
        if (!user) return res.status(404).json({status: "404", message: "User not found, no user with that id", data: {}});
        else if (userAuth) return res.status(200).json({status: "200", message: "Success, user with id " + user.id + " found", data: user});
        else {
            const { password, token, ...sanitizedUser } = user;
            return res.status(200).json({status: "200", message: "Success, user with that id found", data: sanitizedUser});
        }
    })
    .put((req, res) => {
        const userId = parseInt(req.params.userId);
        const editUser = users.find((user) => user.id === userId);

        if (!editUser) return res.status(404).json({status: "404", message: "User not found, edit failed", data: {}});

        if (!req.headers.authorization) return res.status(401).json({status: "401", message: "Unauthorized", data: {}});
        const userAuth = editUser.token === req.headers.authorization.split(' ')[1];

        if (!userAuth) return res.status(403).json({status: "403", message: "Forbidden", data: {}});
        const {firstName, lastName, street, city, email, password, phoneNumber} = req.body;

        if (!email) return res.status(400).json({status: "400", message: "Missing required field, email, edit failed", data: {}});

        if (!validation.validateEmail(email)) {
            return res.status(400).json({
                status: "400",
                message: "Email is not valid, edit failed",
                data: {},
            });
        }
        else if (users.find((user) => user.email === email && user.id !== userId)) return res.status(409).json({status: "409", message: "Email already exists, edit failed", data: {}});

        if (!validation.validatePassword(password)) {
            return res.status(400).json({
                status: "400",
                message: "Password is not valid, edit failed",
                data: {},
            });
        }

        if (!validation.validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({
                status: "400",
                message: "Phone number is not valid, edit failed",
                data: {},
            });
        }

        if (users.find(user => user.email === email && user.id !== userId)) {
            return res.status(409).json({
                status: "409",
                message: "Email already exists, edit failed",
                data: {},
            });
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
    })
    .delete((req, res) => {
        const userId = parseInt(req.params.userId);
        const deleteUser = users.find((user) => user.id === userId);
        if (!deleteUser) return res.status(404).json({status: "404", message: "User not found, delete failed", data: {}});
        if (!req.headers.authorization) return res.status(401).json({status: "401", message: "Unauthorized", data: {}});
        const userAuth = deleteUser.token === req.headers.authorization.split(' ')[1];
        if (!userAuth) return res.status(403).json({status: "403", message: "Forbidden", data: {}});
        else {
            users.splice(users.indexOf(deleteUser), 1);
            return res.status(200).json({status: "200", message: "User successfully deleted", data: deleteUser});
        }
    });
    module.exports = router;
