require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require('./config')
const winston = require('winston');

const app = express();

const morganOption = (NODE_ENV === 'production')

// set up winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authToken = req.get('Authorization')

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  // move to the next middleware
  next()
})

let bookmarks = [{
  id: 1,
  title: "text"
}];


//endpoints start here
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

//GET /bookmarks
app.get("/bookmarks", (req, res) => {
  res.json(bookmarks)
})

//GET /bookmarks/:id
app.get('/bookmarks/:id', (req, res) => {
  let result = bookmarks.find(item => item.id == req.params.id);
  if(!result){
    return res.status(404).send(`${req.params.id} not found`)
  }
  res.json(result);
})
//POST /bookmarks
app.post('/bookmarks', express.json(), (req, res) => {
  const {title, completed = false} = req.body;
  if(!title){
    return res.status(400).send("Title is required")
  }

  const newBookmark = {title, completed,
    id: Math.random()
  };
  bookmarks.push(newBookmark);
  res.status(201).json(newBookmark);
})

//DELETE /bookmarks/:id


module.exports = app;
