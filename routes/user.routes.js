const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

router.get('/profile', authController.validateToken, userController.profile);
router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:userId', authController.validateToken, userController.updateUser);
router.delete('/:userId',authController.validateToken, userController.deleteUser);

module.exports = router;
