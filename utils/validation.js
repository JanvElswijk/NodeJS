function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}
function validateEmailAdress(emailAdress) {
    const regex = /^[a-z]\.[a-z0-9]{2,}@([a-z]{2,}\.)+[a-z]{2,3}$/i;
    return regex.test(emailAdress);
}
function validatePhoneNumber(phoneNumber) {
    const regex = /^06[-\s]?\d{8}$/;
    return regex.test(phoneNumber);
}

module.exports = {
    validatePassword,
    validateEmailAdress,
    validatePhoneNumber,
}