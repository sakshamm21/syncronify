const logger = require('./logger.js');

const errorHandler = (err, req, res, next) => {
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';

    // Do not leak stack traces or internal details to the client in production
    const isProd = process.env.NODE_ENV === 'production';

    logger.error('An error occurred:', {
        message: err.message,
        statusCode: errStatus,
        stack: isProd ? undefined : err.stack,
    });

    res.status(errStatus).json({
        status: 'error',
        message: errMsg,
        ...(isProd ? {} : { stack: err.stack }),
    });
}

module.exports = errorHandler;


// import { Request, Response, NextFunction } from 'express';
// import logger from './logger.js';

// const errorHandler = (err, req, res, next) => {
//     const errStatus = err.statusCode || 500;
//     const errMsg = err.message || 'Something went wrong';
//     logger.error('An error occurred:', err);
//     next();
// }

// export default errorHandler