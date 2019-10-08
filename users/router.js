const express = require("express");
const { Router } = express;

const User = require("./model");

const router = new Router();

router.post("/users", async (req, res, next) => {
  const { name, picture } = req.body;
  if (!name || !picture) {
    return res.send({ body: "Send name and picture!" });
  }

  User.create({ name: name, picture: picture })
    .then(user => res.send(user))
    .catch(next);
});

router.get("/users", (req, res, next) => {
  User.findAll()
    .then(users => res.send(users))
    .catch(next);
});

module.exports = router;
