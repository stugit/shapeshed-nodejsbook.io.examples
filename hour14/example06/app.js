var express = require('express'),
  twitter = require('ntwitter'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  love = 0,
  hate = 0,
  total = 0;


app.set('port', process.env.PORT || 3000);

var twit = new twitter({
  consumer_key: 'YOUR_CONSUMER_KEY',
  consumer_secret: 'YOUR_CONSUMER_SECRET',
  access_token_key: 'YOUR_ACCESS_TOKEN_KEY',
  access_token_secret: 'YOUR_ACCESS_TOKEN_KEY'
});

twit.stream('statuses/filter', { track: ['love', 'hate'] }, function(stream) {
  stream.on('data', function (data) {
    if (data.text) { 
      var text = data.text.toLowerCase();
      if (text.indexOf('love') != -1) {
        love++
        total++
        if ((love % 82) == 0){
          io.sockets.volatile.emit('lover', { 
            user: data.user.screen_name, 
            text: data.text,
            avatar: data.user.profile_image_url_https
          });
        }
      }
      if (text.indexOf('hate') != -1) {
        hate++
        total++
        if ((hate % 18) == 0){
          io.sockets.volatile.emit('hater', { 
            user: data.user.screen_name, 
            text: data.text,
            avatar: data.user.profile_image_url_https
          });
        }
      }
      io.sockets.volatile.emit('percentages', { 
        love: (love/total)*100,
        hate: (hate/total)*100
      });
    }
  });
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
