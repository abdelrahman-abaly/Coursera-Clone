const Customer = require('../models/customers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all customers
let getAllCustomers = async (req, res) => {
    try {
        let customers = await Customer.find();
        res.status(200).json({
            data: customers
        });
    } catch (err) {
        res.status(404).json({
            message: err.message
        });
    }
};

// Add a new customer
let addCustomer = async (req, res) => {
    let customer = req.body;

    try {
        let newCustomer = await Customer.create(customer);
        res.status(201).json({
            message: "Customer added successfully",
            data: newCustomer
        });
    } catch (err) {
        res.status(404).json({
            message: err.message
        });
    }
};

// Get all customers with only first and last name
let getAllCustomerFLName = async (req, res) => {
    try {
        let customers = await Customer.find().select('firstName lastName');
        res.status(200).json({
            data: customers
        });
    } catch (err) {
        res.status(404).json({
            message: err.message
        });
    }
};

// Get a customer by ID
let getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        res.status(200).json({
            data: customer
        });
    } catch (err) {
        res.status(404).json({
            message: err.message
        });
    }
};

// Delete a customer by id only
let deleteCustomer = async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: "Customer deleted successfully"
        });
    } catch (err) {
        res.status(404).json({
            message: err.message
        });
    }
};

// Delete all customers
let deleteAllCustomers = async (req, res) => {
    try {
        await Customer.deleteMany(); // This will delete all customers
        res.status(200).json({
            message: "All customers deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// Update customer (only first name and last name)
let updateCustomer = async (req, res) => {
    let { firstName, lastName } = req.body;

    try {
        let updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName },
            { new: true, select: '-password' }
        );
        res.status(200).json({
            data: updatedCustomer
        });
    } catch (err) {
        res.status(404).json({
            message: err.message
        });
    }
};

// Handle login and generate JWT token
let login = async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(404).json({
            message: "You must provide email and password"
        });
    }

    try {
        // Check if the customer exists
        let customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check if the password is correct
        let isValid = await bcrypt.compare(password, customer.password);

        if (!isValid) {
            return res.status(404).json({
                message: "The password is not valid"
            });
        }

        // Generate a token
        let token = jwt.sign(
            { id: customer._id, email: customer.email },
            'my_jwt_api_secret' // Secret key for JWT
        );

        res.status(200).json({
            token: token // Send the generated token back to the customer
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = { addCustomer, getAllCustomers, getAllCustomerFLName, deleteCustomer,deleteAllCustomers, updateCustomer, login, getCustomerById };
