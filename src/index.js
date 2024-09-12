const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const morgan = require('morgan');
const path = require('path');


const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use(require('./routes/index'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000);
console.log('Server is running on port 3000');
