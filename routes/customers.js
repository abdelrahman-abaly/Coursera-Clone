const express = require('express');
let router = express.Router();
const { addCustomer, getAllCustomers, getAllCustomerFLName, deleteCustomer, deleteAllCustomers, updateCustomer, login,getCustomerById} = require('../controllers/customers');

// Get all Customers
router.get('/', getAllCustomers);

// Add a new Customer
router.post('/', addCustomer);

// Get only the first and last name of all customers
router.get('/names', getAllCustomerFLName);

// Get a customer by id
router.get('/:id', getCustomerById);

// Delete all customers
router.delete('/', deleteAllCustomers);

// Delete a customer by id
router.delete('/:id', deleteCustomer);

// Update a customer by id
router.patch('/:id', updateCustomer);

// Handle the login endpoint
router.post('/login', login);

module.exports = router;
