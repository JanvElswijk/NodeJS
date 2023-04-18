class User {
    constructor(id, firstName, lastName, street, city, isActive, email, password, phoneNumber) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.street = street;
        this.city = city;
        this.isActive = isActive;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
    }
}


module.exports = User;
module.exports.users = [
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