const assert = require("assert");

const db = require("../utils/mysql-db");
const logger = require("../utils/logger").logger

module.exports = {
    createMeal: (req, res) => {
        const userId = req.userId;

        const { name, description, price, dateTime, maxAmountOfParticipants, imageUrl, isVega, isVegan, isToTakeHome, allergenes } = req.body;

        try {
            assert(name, "Name is required");
            assert(description, "Description is required");
            assert(price, "Price is required");
            assert(dateTime, "DateTime is required");
            assert(maxAmountOfParticipants, "MaxAmountOfParticipants is required");
            assert(imageUrl, "ImageUrl is required");

            assert(typeof name === "string", "Name must be a string");
            assert(typeof description === "string", "Description must be a string");
            assert(typeof price === "number", "Price must be a number");
            assert(typeof dateTime === "string", "DateTime must be a string");
            assert(typeof maxAmountOfParticipants === "number", "MaxAmountOfParticipants must be a number");
            assert(typeof imageUrl === "string", "ImageUrl must be a string");

            assert(isVega === undefined || typeof isVega === "boolean", "IsVega must be a boolean");
            assert(isVegan === undefined || typeof isVegan === "boolean", "IsVegan must be a boolean");
            assert(isToTakeHome === undefined || typeof isToTakeHome === "boolean", "IsToTakeHome must be a boolean");
            //Alergenes is a SET in the database, that can only contain the following values: 'gluten','lactose','noten'
            assert(allergenes === undefined || (Array.isArray(allergenes) && allergenes.every((value) => ["gluten", "lactose", "noten"].includes(value))), "Allergenes must be an array of strings containing only the values 'gluten','lactose','noten'");
        } catch (err) {
            logger.warn(err.message);
            return res.status(400).json({
                status: 400,
                message: err.message,
                data: {},
            });
        }

        const requiredValues = [name, description, price, dateTime, maxAmountOfParticipants, imageUrl];
        const optionalValues = [isVega, isVegan, isToTakeHome, allergenes];

        const optionalColumns = optionalValues.filter(value => value !== undefined).map((_, index) => `optional${index + 1}`).join(', ');
        const optionalPlaceholders = optionalValues.filter(value => value !== undefined).map(_ => '?').join(', ');

        const sql = `INSERT INTO meal (name, description, price, dateTime, maxAmountOfParticipants, imageUrl, cookId${optionalColumns ? ', ' + optionalColumns : ''}) 
             VALUES (?, ?, ?, ?, ?, ?, ?${optionalPlaceholders ? ', ' + optionalPlaceholders : ''})`;

        const sqlValues = [...requiredValues, userId, ...optionalValues.filter(value => value !== undefined)];

        db.query(sql, sqlValues, (err, rows) => {
        if (err) {
                logger.error(err);
                return res.status(500).json({
                    status: 500,
                    message: "Internal Server Error",
                    data: {},
                });
            }
            const mealId = rows.insertId;

            // get cook info
            db.query("SELECT * FROM user WHERE id = ?", [userId], (err, rows) => {
                if (err) {
                    logger.error(err);
                    return res.status(500).json({
                        status: 500,
                        message: "Internal Server Error",
                        data: {},
                    });
                }
                const cook = {
                    //id, firstName, lastName, isActive, emailAdress, phoneNumber, street, city
                    id: rows[0].id,
                    firstName: rows[0].firstName,
                    lastName: rows[0].lastName,
                    isActive: rows[0].isActive,
                    emailAdress: rows[0].emailAdress,
                    phoneNumber: rows[0].phoneNumber,
                    street: rows[0].street,
                    city: rows[0].city,
                };
                logger.info("Meal created");
                const meal = {
                    mealId,
                    name,
                    description,
                    price,
                    dateTime,
                    maxAmountOfParticipants,
                    imageUrl,
                    cook
                };

                optionalValues.forEach((value, index) => {
                    if (value !== undefined) {
                        meal[Object.keys(optionalValues)[index]] = value;
                    }
                });

                res.status(201).json({
                    status: 201,
                    message: "Meal created",
                    data: { meal },
                });
            });
        });
    },
    updateMeal: (req, res) => {
        // Verplichte velden: name, price, maxAmountOfParticipants
        // Optionele velden: description, dateTime, imageUrl, isVega, isVegan, isToTakeHome, allergenes
        const userId = req.userId;
        const mealId = req.params.mealId;

        const { name, description, price, dateTime, maxAmountOfParticipants, imageUrl, isVega, isVegan, isToTakeHome, allergenes } = req.body;

        try {
            assert(name, "Name is required");
            assert(price, "Price is required");
            assert(maxAmountOfParticipants, "MaxAmountOfParticipants is required");

            assert(typeof name === "string", "Name must be a string");
            assert(typeof price === "number", "Price must be a number");
            assert(typeof maxAmountOfParticipants === "number", "MaxAmountOfParticipants must be a number");

            assert(description === undefined || typeof description === "string", "Description must be a string");
            assert(dateTime === undefined || typeof dateTime === "string", "DateTime must be a string");
            assert(imageUrl === undefined || typeof imageUrl === "string", "ImageUrl must be a string");
            assert(isVega === undefined || typeof isVega === "boolean", "IsVega must be a boolean");
            assert(isVegan === undefined || typeof isVegan === "boolean", "IsVegan must be a boolean");
            assert(isToTakeHome === undefined || typeof isToTakeHome === "boolean", "IsToTakeHome must be a boolean");
            assert(allergenes === undefined || typeof allergenes === "string", "Allergenes must be a string");
        } catch (err) {
            logger.warn(err.message);
            return res.status(400).json({
                status: 400,
                message: err.message,
                data: {},
            });
        }

        const requiredValues = [name, price, maxAmountOfParticipants];
        const optionalValues = [description, dateTime, imageUrl, isVega, isVegan, isToTakeHome, allergenes];

        let sql = "UPDATE meal SET ";
        sql += "name = ?, price = ?, maxAmountOfParticipants = ?";
        optionalValues.forEach((value, index) => {
            if (value !== undefined) {
                sql += ", " + Object.keys(optionalValues)[index] + " = ?";
            }
        });
        sql += " WHERE id = ?";

        const sql2 = "SELECT * FROM meal WHERE id = ?";
        db.query(sql2, [mealId], (err, rows) => {
            if (err) {
                logger.error(err);
                return res.status(500).json({
                    status: 500,
                    message: "Internal Server Error",
                    data: {},
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "Meal not found",
                    data: {},
                });
            }

            if (rows[0].cookId !== parseInt(userId)) {
                return res.status(403).json({
                    status: 403,
                    message: "Forbidden",
                    data: {},
                });
            }

            db.query(sql, [...requiredValues, ...optionalValues, mealId], (err) => {
                if (err) {
                    logger.error(err);
                    return res.status(500).json({
                        status: 500,
                        message: "Internal Server Error",
                        data: {},
                    });
                }

                db.query("SELECT * FROM user WHERE id = ?", [userId], (err, rows) => {
                    if (err) {
                        logger.error(err);
                        return res.status(500).json({
                            status: 500,
                            message: "Internal Server Error",
                            data: {},
                        });
                    }
                    const cook = {
                        //id, firstName, lastName, isActive, emailAdress, phoneNumber, street, city
                        id: rows[0].id,
                        firstName: rows[0].firstName,
                        lastName: rows[0].lastName,
                        isActive: rows[0].isActive,
                        emailAdress: rows[0].emailAdress,
                        phoneNumber: rows[0].phoneNumber,
                        street: rows[0].street,
                        city: rows[0].city,
                    };
                    logger.info("Meal updated");
                    const meal = {
                        mealId: parseInt(mealId),
                        name,
                        description,
                        price,
                        dateTime,
                        maxAmountOfParticipants,
                        imageUrl,
                        cook
                    };

                    optionalValues.forEach((value, index) => {
                        if (value !== undefined) {
                            meal[Object.keys(optionalValues)[index]] = value;
                        }
                    });

                    res.status(200).json({
                        status: 200,
                        message: "Meal updated",
                        data: { meal },
                    });
                });
            });
        });
    },
    getAllMeals: (req, res) => {
        const sql = "SELECT * FROM meal";
        db.query(sql, (err, rows) => {
            if (err) {
                logger.error(err);
                return res.status(500).json({
                    status: 500,
                    message: "Internal Server Error",
                    data: {},
                });
            }

            let meals = [];
            let count = 0;

            const processRow = (row) => {
                db.query("SELECT * FROM user WHERE id = ?", [row.cookId], (err, cookRows) => {
                    if (err) {
                        logger.error(err);
                        return res.status(500).json({
                            status: 500,
                            message: "Internal Server Error",
                            data: {},
                        });
                    }

                    const cook = {
                        id: cookRows[0].id,
                        firstName: cookRows[0].firstName,
                        lastName: cookRows[0].lastName,
                        isActive: cookRows[0].isActive,
                        emailAdress: cookRows[0].emailAdress,
                        phoneNumber: cookRows[0].phoneNumber,
                        street: cookRows[0].street,
                        city: cookRows[0].city,
                    };

                    meals.push({
                        mealId: row.id,
                        name: row.name,
                        description: row.description,
                        price: row.price,
                        dateTime: row.dateTime,
                        maxAmountOfParticipants: row.maxAmountOfParticipants,
                        imageUrl: row.imageUrl,
                        isVega: row.isVega,
                        isVegan: row.isVegan,
                        isToTakeHome: row.isToTakeHome,
                        allergenes: row.allergenes,
                        cook,
                    });

                    count++;

                    if (count === rows.length) {
                        // All cook information retrieved
                        res.status(200).json({
                            status: 200,
                            message: "All meals",
                            data: { meals },
                        });
                    }
                });
            };

            if (rows.length === 0) {
                // No meals, send response immediately
                res.status(200).json({
                    status: 200,
                    message: "All meals",
                    data: { meals },
                });
            } else {
                rows.forEach((row) => {
                    processRow(row);
                });
            }
        });
    },
    getMealById: (req, res) => {
        const sql = "SELECT * FROM meal WHERE id = ?";
        const mealId = req.params.mealId;
        db.query(sql, [mealId], (err, rows) => {
            if (err) {
                logger.error(err);
                return res.status(500).json({
                    status: 500,
                    message: "Internal Server Error",
                    data: {},
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "Meal not found",
                    data: {},
                });
            }

            const row = rows[0];

            db.query("SELECT * FROM user WHERE id = ?", [row.cookId], (err, cookRows) => {
                if (err) {
                    logger.error(err);
                    return res.status(500).json({
                        status: 500,
                        message: "Internal Server Error",
                        data: {},
                    });
                }

                const cook = {
                    id: cookRows[0].id,
                    firstName: cookRows[0].firstName,
                    lastName: cookRows[0].lastName,
                    isActive: cookRows[0].isActive,
                    emailAdress: cookRows[0].emailAdress,
                    phoneNumber: cookRows[0].phoneNumber,
                    street: cookRows[0].street,
                    city: cookRows[0].city,
                };

                const meal = {
                    mealId: row.id,
                    name: row.name,
                    description: row.description,
                    price: row.price,
                    dateTime: row.dateTime,
                    maxAmountOfParticipants: row.maxAmountOfParticipants,
                    imageUrl: row.imageUrl,
                    isVega: row.isVega,
                    isVegan: row.isVegan,
                    isToTakeHome: row.isToTakeHome,
                    allergenes: row.allergenes,
                    cook,
                };

                res.status(200).json({
                    status: 200,
                    message: "Meal",
                    data: { meal },
                });
            });
        });
    },
    deleteMeal: (req, res) => {
        const userId = req.userId;
        const mealId = req.params.mealId;

        const sql = "SELECT * FROM meal WHERE id = ?";
        db.query(sql, [mealId], (err, rows) => {
            if (err) {
                logger.error(err);
                return res.status(500).json({
                    status: 500,
                    message: "Internal Server Error",
                    data: {},
                });
            }
            if (rows.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "Meal not found",
                    data: {},
                });
            }

            if (rows[0].cookId !== userId) {
                return res.status(403).json({
                    status: 403,
                    message: "Forbidden",
                    data: {},
                });
            }

            db.query("DELETE FROM meal WHERE id = ?", [mealId], (err) => {
                if (err) {
                    logger.error(err);
                    return res.status(500).json({
                        status: 500,
                        message: "Internal Server Error",
                        data: {},
                    });
                }

                res.status(200).json({
                    status: 200,
                    message: "Meal with id " + mealId + " deleted",
                    data: {},
                });
            });
        });
    },
}