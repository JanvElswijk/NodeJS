function validatePassword(password) {
    // Regex betekent: minimaal 8 karakters, minimaal 1 hoofdletter, minimaal 1 cijfer
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}
function validateEmailAdress(emailAdress) {
    // Regex betekent: begint met een letter, dan een punt, dan minimaal 2 karakters, dan een @, dan minimaal 2 letters, dan een punt, dan minimaal 2 of 3 letters
    const regex = /^[a-z]\.[a-z0-9]{2,}@([a-z]{2,}\.)+[a-z]{2,3}$/i;
    return regex.test(emailAdress);
}
function validatePhoneNumber(phoneNumber) {
    // Regex betekent: begint met 06, dan een streepje of spatie of niets, dan 8 cijfers
    const regex = /^06[-\s]?\d{8}$/;
    return regex.test(phoneNumber);
}

module.exports = {
    validatePassword,
    validateEmailAdress,
    validatePhoneNumber,
}