const jwt = require('jsonwebtoken');
const Util = require('util');

exports.auth = async function(req, res, next) {

    let {authorization} = req.headers;

    if(!authorization) {
        return res.status(401).json({message: "You must be logged in first."});
    }

    try {

        let decoded = await Util.promisify(jwt.verify)(authorization, process.env.SECRET);

        req.id = decoded.id;

        next();
    } catch (err) {
        res.status(401).json({message: 'You are not authenticated, Try again'});
    }
}