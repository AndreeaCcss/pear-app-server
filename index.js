const express = require("express");
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const cors = require("cors");
const bodyParser = require("body-parser");

const userRouter = require("./users/router");

const app = express();

const port = process.env.PORT || 4000;

const corsMiddleware = cors();
const JSONparser = bodyParser.json();

app.use(corsMiddleware);
app.use(JSONparser);
app.use(userRouter);

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://dev-da3wy089.eu.auth0.com/.well-known/jwks.json"
  }),
  issuer: "https://dev-da3wy089.eu.auth0.com/",
  algorithms: ["RS256"]
});

// app.use(jwtCheck);

app.get("/authorized", function(req, res) {
  res.send("Secured Resource");
});

const server = app.listen(port, () => console.log(`Listening on port ${port}`));

const io = require("socket.io")(server);
io.origins("*:*");

io.on("connection", function(socket) {
  console.log("got connection", socket.id);

  socket.on("NewClient", function(data) {
    socket.leave(socket.id, () => {
      socket.join(data.roomId, () => {
        socket.in(data.roomId).emit("CreatePeer");
      });
    });

    socket.on("disconnect", () => Disconnect(socket, data.roomId));
  });

  socket.on("Offer", SendOffer);
  socket.on("Answer", SendAnswer);
});

function Disconnect(socket, roomId) {
  socket.in(roomId).emit("Disconnect");
}

function SendOffer(offer) {
  const rooms = Object.keys(this.rooms);
  this.in(rooms[rooms.length - 1]).emit("BackOffer", offer);
}

function SendAnswer(data) {
  const rooms = Object.keys(this.rooms);
  this.in(rooms[rooms.length - 1]).emit("BackAnswer", data);
}
