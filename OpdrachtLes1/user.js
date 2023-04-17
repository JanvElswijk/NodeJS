class User {
    constructor(id, firstName, lastName, street, city, isActive, email, password, phoneNumber) {

        // TODO: Add token
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