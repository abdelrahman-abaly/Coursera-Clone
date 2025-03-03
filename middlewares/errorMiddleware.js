const AppError = require("../Utils/appError");

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        error:err
    })
}

const globalError =(err,req,res,next)=>{
    err.statusCode = err.statusCode ||500;
    err.status = err.status || "error";
    
    if (process.env.NODE_ENV==='development') {
      sendErrorForDev(err,res);
    } else if(process.env.NODE_ENV==='production') {
        sendErrorForProd(err,res);
    }else{
      console.log("sdkgodijgfsidm");
      
    }
    next();
  }

  module.exports = globalError;