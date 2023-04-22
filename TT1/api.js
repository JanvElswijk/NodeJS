const express = require("express");
const router = express.Router();
const { User, users } = require("./user");
const assert = require("assert");

const bodyParser = require("body-parser");
const validation = require("./validation");


router.use(bodyParser.json());

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
        return;
    }

    const newUser = new User(
        users.length + 1,
        firstName,
        lastName,
        street,
        city,
        true,
        email,
        password,
        phoneNumber
    );

    users.push(newUser);

    res.status(201).json({
        status: "201",
        message: "New user registered",
        data: newUser,
    });
});

// UC-202 /api/user
// UC-202 /api/user?field1=:value1&field2=:value
router.get('/user', (req, res) => {
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
});


// UC-203 /api/user/profile
router.get("/user/profile", (req, res) => {
  res.status(501).json({
    status: "501",
    message: "Not implemented, will be implemented soon\u2122",
    data: {},
  });
});

router.route("/user/:userId")
    //UC-204 /api/user/:userId
    .get((req, res) => {
        const userId = parseInt(req.params.userId);
        const user = users.find(user => user.id === userId);
        if (!user) {

            return res.status(404).json({
                status: "404",
                message: "User not found, no user with that id",
                data: {},
            });
        }
        const { password, ...sanitizedUser } = user;

        res.status(200).json({
            status: "200",
            message: `Success, user with that id found`,
            data: sanitizedUser,
        });
    })
    //UC-205 /api/user/:userId
    .put((req, res) => {
        const userId = parseInt(req.params.userId);
        const editUser = users.find(user => user.id === userId);
        const { firstName, lastName, street, city, email, password, phoneNumber } = req.body;

        try {
            assert(email, "Missing required field, email, edit failed");
            assert(validation.validateEmail(email), "Email is not valid, edit failed");
            if (phoneNumber) {
                assert(validation.validatePhoneNumber(phoneNumber), "Phone number is not valid, edit failed");
            }
            assert(editUser, "User not found, edit failed");
            assert(!users.find(user => user.email === email && user.id !== userId), "User with that email already exists, registration failed");
        } catch (err) {
            if (err.message === "User not found, edit failed") {
                return res.status(404).json({
                    status: "404",
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
            return;
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
    //UC-206 /api/user/:userId
    .delete((req, res) => {
        const userId = parseInt(req.params.userId);
        const deleteUser = users.find(user => user.id === userId);
        if (!deleteUser) {
            return res.status(404).json({
                status: "404",
                message: "User not found, delete failed",
                data: {},
            });
        }
        const { password, ...sanitizedUser } = deleteUser;
        users.splice(users.indexOf(deleteUser), 1);
        res.status(200).json({
            status: "200",
            message: `User successfully deleted`,
            data: sanitizedUser,
        });
    });

    module.exports = router;
