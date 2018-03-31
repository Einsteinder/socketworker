const redisConnection = require("./redis-connection");
const axios = require("axios");

var API_KEY = '8547473-192d21ba9cf3dee0267d6a331';


redisConnection.on("getphoto", (data, channel) => {
  let username = data.username;
  let message = data.message;
  let query = data.query;
  var URL = "https://pixabay.com/api/?key="+API_KEY+"&q="+encodeURIComponent(query);

  async function getData() {
    let gistResults = await axios.get(URL)
    if (gistResults.data === null) {
        setTimeout(getData, 5000);
      } else {
          console.log(gistResults.data)
          await redisConnection.emit(`results-return:${data.channelId}`, {
            returndata: gistResults.data,
            username:username,
            message: message
          });
     

        }
  }
  getData();
});



