const express = require("express");
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const { join } = require("path");
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

let clients = 0;

io.on("connection", function(socket) {
  console.log("got connection", socket.id);

  socket.on("NewClient", function(data) {
    // if (clients < 2) {
    //  if (clients == 1) {
    // this.emit("CreatePeer");

    console.log("rooms before leaving", socket.rooms);
    console.log("socketId before leaving", socket.id);
    socket.leave(socket.id, () => {
      console.log("rooms after leaving", socket.rooms);
      console.log("roomId before joining", data.roomId);
      socket.join(data.roomId, () => {
        console.log("rooms after joining", socket.rooms);
        socket.in(data.roomId).emit("CreatePeer");
      });
    });

    socket.on("disconnect", () => Disconnect(socket, data.roomId));

    // socket.emit("CreatePeer");
    //   }
    // } else this.emit("SessionActive");
    // clients++;
  });

  socket.on("Offer", SendOffer);
  socket.on("Answer", SendAnswer);
  // socket.on("disconnect", () => Disconnect(socket, data.roomId));

  // socket.on("changeToRoom", function(params) {
  //   socket.leave(socket.id);
  //   socket.join(params.roomId);

  //   // socket.in(params.id).emit("CreatePeer");
  //   // socket.leave(socket.id);
  //   //socket.emit(socket.id);
  //   // socket.in(socket.id).emit("Disconnect");
  //   console.log("socket", params.id);
  // });
});

function Disconnect(socket, roomId) {
  // if (clients > 0) {
  //   if (clients <= 2) {
  // console.log("data Disconnect", data);
  // console.log("this Disconnect rooms", this.rooms);
  socket.in(roomId).emit("Disconnect");
  //   }
  //   clients--;
  // }
}

function SendOffer(offer) {
  console.log("sendOffer rooms", this.rooms);
  const rooms = Object.keys(this.rooms);
  this.in(rooms[rooms.length - 1]).emit("BackOffer", offer);
}

function SendAnswer(data) {
  console.log("sendAnswer rooms", this.rooms);
  const rooms = Object.keys(this.rooms);
  this.in(rooms[rooms.length - 1]).emit("BackAnswer", data);
}

// const nsp = io.of("/my-namespace");
// nsp.on("connection", function(socket) {
//   console.log("someone connected");
// });

// nsp.emit("hi", "everyone!");
