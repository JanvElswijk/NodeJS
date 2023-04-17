const express = require("express");
const router = express.Router();
const User = require("./user");

const bodyParser = require("body-parser");
// const crypto = require('crypto');

router.use(bodyParser.json());

// TODO: Generate and add tokens to users
const users = [
  new User(
    1,
    "John",
    "Doe",
    "Main Street 1",
    "New York",
    true,
    "john@avans.nl",
    "1234",
    "0612345678"
  ),
  new User(
    2,
    "Jane",
    "Doe",
    "Main Street 2",
    "New York",
    true,
    "jane@avans.nl",
    "1234",
    "0612345678"
  ),
  new User(
    3,
    "Jack",
    "Doe",
    "Main Street 3",
    "New York",
    true,
    "jack@avans.nl",
    "1234",
    "0612345678"
  ),
  new User(
    4,
    "Jill",
    "Doe",
    "Main Street 4",
    "New York",
    true,
    "jill@avans.nl",
    "1234",
    "0612345678"
  ),
];


// UC-201 /api/register
router.post("/register", (req, res) => {
  const { firstName, lastName, street, city, email, password, phonenumber } =
    req.body;

  // Check if all fields are present and not empty
  if (
    !firstName ||
    !lastName ||
    !street ||
    !city ||
    !email ||
    !password ||
    !phonenumber
  ) {
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
  const newUser = new User(
    users.length + 1,
    firstName,
    lastName,
    street,
    city,
    true,
    email,
    password,
    phonenumber
  );

  // TODO: Implementation
  // Create token
  // newUser.token = crypto.createHash('sha256').update(JSON.stringify(newUser)).digest('hex');

  users.push(newUser);

  res.status(201).json({
    status: "201",
    message: "User created",
    data: newUser,
  });

  /* Test user
    {
        "firstName": "Jam",
        "lastName": "van Elswijk",
        "street": "de Polderstraat 66",
        "city": "Heijningen",
        "email": "jan@avans.nl",
        "password": "1234",
        "phonenumber": "0612345678"
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
    res.status(404).json({
      status: "404",
      message: "No users found",
      data: {},
    });
  } else if (Object.keys(req.query).length === 0) {
    res.status(200).json({
      status: "200",
      message: "Success",
      //FIX: Shows (soon token) and password
      data: users,
    });
  } else {
    const filteredUsers = users.filter((user) => {
      let matchesFilters = true;
      for (const key in req.query) {
        const queryValue = req.query[key];
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
    if (filteredUsers.length === 0) {
      res.status(404).json({
        status: "404",
        message: "No users found",
        data: {},
      });
    } else {
      res.status(200).json({
        status: "200",
        message: "Success",
        //FIX: Shows (soon token) and password
        data: filteredUsers,
      });
    }
  }
});

// UC-203 /api/user/:userId
router.get("/user/profile", (req, res) => {
  //TODO: get user from token
  res.send("profile");
});

router.route("/user/:userId")
  // UC-204 /api/user/:userId
    // TODO: get more details with token corresponding to userId
  .get((req, res) => {
    const userId = parseInt(req.params.userId);
    const user = users.find((user) => user.id === userId);
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
          //FIX: Shows (soon token) and password for user that does not have same token
            data: user,
        });
    }
  })
  // UC-205 /api/user/:userId
  .put((req, res) => {
      const userId = parseInt(req.params.userId);
      const editUser = users.find((user) => user.id === userId);
      const { firstName, lastName, street, city, email, password, phonenumber } =
          req.body;
      if (
          !firstName ||
          !lastName ||
          !street ||
          !city ||
          !email ||
          !password ||
          !phonenumber ||
          !editUser
      ) {
        return res.status(400).json({
          status: "400",
          message: "Missing required fields or user not found",
        });
      //TODO: Check token before editing
      } else {
        editUser.firstName = firstName;
        editUser.lastName = lastName;
        editUser.street = street;
        editUser.city = city;
        editUser.email = email;
        editUser.password = password;
        editUser.phonenumber = phonenumber;
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
          //FIX: Shows (soon token) and password for user that does not have same token
            data: deleteUser,
        });
    }
  });

    module.exports = router;