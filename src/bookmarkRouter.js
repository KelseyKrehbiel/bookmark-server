const express = require("express");
const bookmarks = require("./store");
const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, completed = false } = req.body;
    if (!title) {
      return res.status(400).send("Title is required");
    }

    const newBookmark = { title, completed, id: Math.random() };
    bookmarks.push(newBookmark);
    res.status(201).json(newBookmark);
  });

bookmarkRouter
  .route("/bookmarks/:id")
  .get((req, res) => {
    let result = bookmarks.find((item) => item.id == req.params.id);
    if (!result) {
      return res.status(404).send(`${req.params.id} not found`);
    }
    res.json(result);
  })
  .delete((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = bookmarks.findIndex((b) => b.id == id);
    const logger = req.app.get("logger");
    if (bookmarkIndex === -1) {
      logger.error(`bookmark with id ${id} not found.`);
      return res.status(404).send("Not found");
    }

    //remove bookmark from lists
    //assume bookmarkIds are not duplicated in the bookmarkIds array

    bookmarks.splice(bookmarkIndex, 1);

    logger.info(`bookmark with id ${id} deleted.`);

    res.status(204).end();
  });
module.exports = bookmarkRouter;
