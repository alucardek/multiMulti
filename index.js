/*var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req,res){
	res.sendfile('index.html');
	//res.sendfile('mobile.html');
});


io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(1337,"127.0.0.1", function(){
	console.log('listening on *:0.0.0.0:1337');
});
*/

var express =require('express');
var app = express.createServer();


app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

var io = require('socket.io').listen(app);

var rooms = [];

function room(roomSocket, roomId){
  this.roomSocket = roomSocket;
  this.roomId = roomId;
  this.mobileSockets = [];
};



app.listen(8080);

io.sockets.on('connection', function (socket) {
	console.log('yep!');
});
