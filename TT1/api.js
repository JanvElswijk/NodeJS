const express = require("express");
const router = express.Router();
const { User, users } = require("./user");

const bodyParser = require("body-parser");

const checkAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        res.status(401).json({
            status: "401",
            message: "Unauthorized, no authentication token provided",
            data: {}
        });
    }

    const authToken = req.headers.authorization;

    // Check if the authentication token is valid
    const accessToken = authToken.split(' ')[1]; // Extract access token from Authorization header

    const user = users.find((user) => user.token === accessToken);

    if (!user) {
        res.status(401).json({
            status: "401",
            message: "Unauthorized, invalid authentication token provided",
            data: {}
        });
    } else {
        // Add the user object to the request object
        req.user = user;
        next();
    }
};

router.use(bodyParser.json());

// UC-201 /api/register
router.post("/register", (req, res) => {
    const { firstName, lastName, street, city, email, password, phoneNumber } = req.body;

    // Check if all fields are present and not empty
    if (!firstName || !lastName || !street || !city || !email || !password || !phoneNumber) {
        return res.status(400).json({
            status: "400",
            message: "Missing required fields for registration",
        });
    }

    // Check if email is unique
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
        return res.status(409).json({
            status: "409",
            message: "Email already exists, registration failed",
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

  /* Test user
    {
        "firstName": "Jan",
        "lastName": "van Elswijk",
        "street": "de Polderstraat 66",
        "city": "Heijningen",
        "email": "jan@avans.nl",
        "password": "1234",
        "phoneNumber": "0612345678"
    }
     */
});

// UC-202 /api/user
// UC-202 /api/user?field1=:value1&field2=:value
router.get("/user", (req, res) => {
  const validFields = Object.keys(new User());

  const invalidFields = Object.keys(req.query).filter(
    (key) => !validFields.includes(key)
  );

  if (invalidFields.length > 0) {
      console.log(`(/api/user w/ filter) invalidFields.length > 0`)
    res.status(404).json({
      status: "404",
      message: "No users found, invalid fields: " + invalidFields.join(", "),
      data: {},
    });
  } else if (Object.keys(req.query).length === 0) {
      const sanitizedUsers = users.map(({password, token, ...rest}) => ({...rest}));
      console.log('(/api/user no filter) ' + sanitizedUsers.length + ' users found')
    res.status(200).json({
      status: "200",
      message: "Success, no filters applied",
      data: sanitizedUsers,
    });
  } else {
      const filterUsers = (users, filters) => {
          return users.filter((user) => {
              let matchesFilters = true;
              for (const key in filters) {
                  const queryValue = filters[key];
                  const userValue = user[key];

                  if (typeof userValue === "boolean") {
                      if (queryValue !== userValue.toString()) {
                          matchesFilters = false;
                          break;
                      }
                  } else {
                      if (queryValue !== userValue) {
                          matchesFilters = false;
                          break;
                      }
                  }
              }
              return matchesFilters;
          });
      };
      const filters = req.query;
      let filteredUsers = filterUsers(users, filters)
    if (filteredUsers.length === 0) {
        console.log('(/api/user w/ filter) filteredUsers is empty')
      res.status(404).json({
        status: "404",
        message: "No users found",
        data: {},
      });
    } else {
        const sanitizedFilteredUsers = filteredUsers.map(({password, token, ...rest}) => ({...rest}));
        console.log('(/api/user w/ filter) ' + sanitizedFilteredUsers.length + ' users found')
      res.status(200).json({
        status: "200",
        message: "Success, filters applied",
        data: sanitizedFilteredUsers,
      });
    }
  }
});

// UC-203 /api/user/profile
router.get("/user/profile", checkAuth, (req, res) => {
    const { user } = req;
    res.status(200).json({
        status: "200",
        message: "Success, user profile found",
        data: user,
    });
});

router.route("/user/:userId")
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
            return res.status(200).json({status: "200", message: "Success, user with id " + sanitizedUser.id + " found", data: sanitizedUser});
        }
    })
    .put((req, res) => {
        const userId = parseInt(req.params.userId);
        const editUser = users.find((user) => user.id === userId);
        if (!req.headers.authorization) return res.status(401).json({status: "401", message: "User not authorized, edit failed", data: {}});
        const userAuth = editUser.token === req.headers.authorization.split(' ')[1];
        if (!userAuth) return res.status(401).json({status: "401", message: "User not authorized, edit failed", data: {}});
        const {firstName, lastName, street, city, email, password, phoneNumber} = req.body;
        if (!email || !editUser) return res.status(400).json({status: "400", message: "Missing required fields or user not found, edit failed", data: {}});
        else if (users.find((user) => user.email === email && user.id !== userId)) return res.status(409).json({status: "409", message: "Email already exists, edit failed", data: {}});
        else {
            editUser.firstName = firstName || editUser.firstName;
            editUser.lastName = lastName || editUser.lastName;
            editUser.street = street || editUser.street;
            editUser.city = city || editUser.city;
            editUser.email = email;
            editUser.password = password || editUser.password;
            editUser.phoneNumber = phoneNumber || editUser.phoneNumber;
            return res.status(201).json({status: "201", message: "User successfully edited", data: editUser});
        }
    })
    .delete((req, res) => {
        const userId = parseInt(req.params.userId);
        const deleteUser = users.find((user) => user.id === userId);
        if (!req.headers.authorization) return res.status(401).json({status: "401", message: "User not authorized, delete failed", data: {}});
        const userAuth = deleteUser.token === req.headers.authorization.split(' ')[1];
        if (!userAuth) return res.status(401).json({status: "401", message: "User not authorized, delete failed", data: {}});
        if (!deleteUser) return res.status(400).json({status: "400", message: "User not found, delete failed", data: {}});
        else {
            users.splice(users.indexOf(deleteUser), 1);
            return res.status(201).json({status: "201", message: "Deletion successful, " + deleteUser.firstName + " " + deleteUser.lastName + " deleted", data: deleteUser});
        }
    });
    module.exports = router;
