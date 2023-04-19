const express = require("express");
const router = express.Router();
const { User, users } = require("./user");
//TODO: Shit's broke, can't request newly registered users

const bodyParser = require("body-parser");

router.use(bodyParser.json());

// UC-201 /api/register
router.post("/register", (req, res) => {
    const { firstName, lastName, street, city, email, password, phoneNumber } = req.body;

    // Check if all fields are present and not empty
    if (!firstName || !lastName || !street || !city || !email || !password || !phoneNumber) {
        return res.status(400).json({
            status: "400",
            message: "Missing required fields",
        });
    }

    // Check if email is unique
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
        return res.status(409).json({
            status: "409",
            message: "Email already exists",
        });
    }

    // Create new user
    const newUser = new User(users.length + 1, firstName, lastName, street, city, true, email, password, phoneNumber);

    users.push(newUser);

    res.status(201).json({
        status: "201",
        message: "User created",
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
      console.log('invalidFields.length > 0')
    res.status(404).json({
      status: "404",
      message: "No users found",
      data: {},
    });
  } else if (Object.keys(req.query).length === 0) {
      const sanitizedUsers = users.map(({password, ...rest}) => ({...rest}));
    res.status(200).json({
      status: "200",
      message: "Success",
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
        console.log('filteredUsers is empty')
      res.status(404).json({
        status: "404",
        message: "No users found",
        data: {},
      });
    } else {
        const sanitizedFilteredUsers = filteredUsers.map(({password, ...rest}) => ({...rest}));
      res.status(200).json({
        status: "200",
        message: "Success",
        data: sanitizedFilteredUsers,
      });
    }
  }
});

// UC-203 /api/user/profile
router.get("/user/profile", (req, res) => {
  res.status(501).json({
    status: "501",
    message: "Not implemented",
    data: {},
  });
});

router.route("/user/:userId")
  // UC-204 /api/user/:userId
  .get((req, res) => {
    const userId = parseInt(req.params.userId);
    const user = users.find((user) => user.id === userId);
    const {password, ...sanitizedUser} = user;
    if (!user) {
        res.status(404).json({
            status: "404",
            message: "User not found",
            data: {},
        });
    } else {
        res.status(200).json({
            status: "200",
            message: "Success",
            data: sanitizedUser,
        });
    }
  })
  // UC-205 /api/user/:userId
  .put((req, res) => {
      const userId = parseInt(req.params.userId);
      const editUser = users.find((user) => user.id === userId);
      const { firstName, lastName, street, city, email, password, phoneNumber } =
          req.body;
      if (
          !firstName ||
          !lastName ||
          !street ||
          !city ||
          !email ||
          !password ||
          !phoneNumber ||
          !editUser
      ) {
        return res.status(400).json({
          status: "400",
          message: "Missing required fields or user not found",
        });
      } else {
        editUser.firstName = firstName;
        editUser.lastName = lastName;
        editUser.street = street;
        editUser.city = city;
        editUser.email = email;
        editUser.password = password;
        editUser.phoneNumber = phoneNumber;
        console.log(editUser.firstName + " " + editUser.lastName)
        res.status(201).json({
          status: "201",
          message: "User edited",
          data: editUser,
        });
      }
    })
  // UC-206 /api/user/:userId
  .delete((req, res) => {
    const userId = parseInt(req.params.userId);
    const deleteUser = users.find((user) => user.id === userId);
    const {password, ...sanitizedUser} = deleteUser;
    if (!deleteUser) {
        return res.status(400).json({
            status: "400",
            message: "User not found",
        });
    } else {
        users.splice(users.indexOf(deleteUser), 1);
        res.status(201).json({
            status: "201",
            message: "User deleted",
            data: sanitizedUser,
        });
    }
  });

    module.exports = router;