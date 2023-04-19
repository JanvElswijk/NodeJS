const express = require("express");
const router = express.Router();
const { User, users } = require("./user");

const bodyParser = require("body-parser");

function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&+-=[\]{};':"\\|,.<>\/?]{8,}$/;
    return regex.test(password);
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePhoneNumber(phoneNumber) {
    const regex = /^\d{10}$/;
    return regex.test(phoneNumber);
}

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

    if (!validatePassword(password)) {
        return res.status(400).json({
            status: "400",
            message: "Password is not valid, registration failed",
            data: {},
        });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({
            status: "400",
            message: "Email is not valid, registration failed",
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

  res.status(501).json({
    status: "501",
    message: "Not implemented, profile not yet visible",
    data: {},
  });
});

router.route("/user/:userId")
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
    .put((req, res) => {
        const userId = parseInt(req.params.userId);
        const editUser = users.find(user => user.id === userId);
        const { firstName, lastName, street, city, email, password, phoneNumber } = req.body;
        if (!email) {

            return res.status(400).json({
                status: "400",
                message: "Missing required field, email, edit failed",
                data: {},
            });
        }
        if (!editUser) {

            return res.status(404).json({
                status: "404",
                message: "User not found, edit failed",
                data: {},
            });
        }

        if (!validatePhoneNumber(phoneNumber)) {

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
