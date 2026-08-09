const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authMain.js');
const eventRoutes = require('./routes/eventRoutes.js');
const errorHandler = require('./middleware/errorHandler.js');

dotenv.config();
const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/health', (req, res) => res.status(200).send({ message: 'Synchronify Http and Tcp-socket servers are running' }));
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// 404 handler — return JSON instead of the default HTML page
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

module.exports = app;


// import dotenv from 'dotenv';
// import cors from 'cors';
// import express from 'express';
// // import webRoutes from './routes/web';
// import authRoutes from './routes/authMain.js';
// import errorHandler from './middleware/errorHandler.js';

// dotenv.config();
// const app = express();
// app.use(cors());

// app.use(express.json());

// app.use('/health', (req, res) => res.status(200).send({message : 'Synchronify Http and Tcp-socket servers are running'}))
// app.use('/api', webRoutes);
// app.use('./api/auth', authRoutes);
// app.use(errorHandler);


// export default appMain;