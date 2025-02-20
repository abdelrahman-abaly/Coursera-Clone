const express = require("express");
let router = express.Router();


const { createUsers, readAllUsers, readUserById, updateUser, deleteUser, login, updatePassword} = require("../controllers/users");

const {auth} = require("../middlewares/auth");


router.post('/', createUsers);

router.get('/', readAllUsers);
 

router.get('/:id', readUserById);


router.patch('/:id', updateUser);


router.delete('/:id', deleteUser);


router.post('/login', login);

router.patch('/updateMyPassword', auth, updatePassword);


module.exports = router;