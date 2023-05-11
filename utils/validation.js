function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&+-=[\]{};':"\\|,.<>\/]{8,}$/;
    return regex.test(password);
}
function validateEmailAdress(emailAdress) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailAdress);
}
// function validatePhoneNumber(phoneNumber) {
//     const regex = /^\d{10}$/;
//     return regex.test(phoneNumber);
// }

module.exports = {
    validatePassword,
    validateEmailAdress,
    // validatePhoneNumber,
}