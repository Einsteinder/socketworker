var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const bodyParser = require("body-parser");
const redisConnection = require("./redis-connection");
var channelId = 0



app.use(bodyParser.json());


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('chat message', function (msg) {
    var arrayOfStrings = msg.split("|");
    var username = arrayOfStrings[0]
    var query = arrayOfStrings[1]
    var message = arrayOfStrings[2]
    console.log('message: ' + arrayOfStrings);
    redisConnection.emit(`getphoto`, {
      username: username,
      message: message,
      query: query,
      channelId:channelId

    });
    channelId++


  });
});


io.on('connection', function (socket) {

  socket.on('chat message', function (msg) {


    redisConnection.on(`results-return:${channelId}`, (data) => {


      if (Number(data.returndata.totalHits) > 0) {
        let arrayOfImage = []

        for (let i = 0; i < data.returndata.hits.length; i++) {

          arrayOfImage.push(data.returndata.hits[i].previewURL)
        }
        let result = { result: arrayOfImage, username: data.username, message: data.message }
        io.emit('got result', result);
      } else {
        io.emit('got result', "no hits")
      }

    })

  
  });
});


http.listen(3000, function () {
  console.log('listening on *:3000');
});
