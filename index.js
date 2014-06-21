var PORT = 8000;
var tempid = 'test';
//var moblink = "/mobile.html?id=" + tempid;
//moblink = "/mobile.html?id=test";

var http = require('http'),
    fs = require('fs'),
    server = http.createServer(function(req, res) {
        if (req.url === '/') {
            var file = 'index.html';
            var stat = fs.statSync(file);
            var stream = fs.createReadStream(file);
            res.writeHead(200, { 'Content-Type': 'text/html',
                                 'Content-Length': stat.size });
            stream.pipe(res);

            return;
        }/* else if (req.url === '/next') {
            console.log('multiMulti.next_page');
        } else if (req.url === '/prev') {
            console.log('multiMulti.previous_page');
        } else if (req.url === '/first') {
            console.log('multiMulti.goto_page page_name 1');
        } else if (req.url === '/last') {
            console.log('multiMulti.goto_page page_name page_count');
        } else if (req.url === '/blank') {
            console.log('multiMulti.toggle_blank_screen');
        } 

        else if (req.url === moblink) {
          console.log("routes on mobile: " + moblink)
          var file = 'mobile.html';
          var stat = fs.statSync(file);
          var stream = fs.createReadStream(file);
          res.writeHead(200, { 'Content-Type': 'text/html',
                                 'Content-Length': stat.size });
          stream.pipe(res);

          return;   

        } else {
          console.log('problem ' + moblink);
        }*/else if (req.url == '/mobile') {
          var file = 'mobile.html';
          var stat = fs.statSync(file);
          var stream = fs.createReadStream(file);
          res.writeHead(200, { 'Content-Type': 'text/html',
                                 'Content-Length': stat.size });
          stream.pipe(res);

          return;
        }
        res.end();
    });
 
server.on('listening', function() {
    var addr = getLocalIp();
    var port = server.address().port;
    var url = 'http://' + addr + ':' + port;
 
    console.log('multiMulti.SetUrl "' + url + '"');
});



var io = require('socket.io').listen(server);
var rooms = [];

function room(roomSocket, roomId){
  this.roomSocket = roomSocket;
  this.roomId = roomId;
  this.mobileSockets = [];
};

 
// Helper function: return the first non-loopback IPv4 address
function getLocalIp() {
    function startsWith(str1, str2) {
        return (str1.slice(0, str2.length) === str2);
    }
    var os = require('os');
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        for (var i in ifaces[dev]) {
            details = ifaces[dev][i];
            if (details.family === 'IPv4') {
                if (startsWith(details.address, '127.') === false) {
                    return details.address;
                }
            }
        }
    }
    return 'localhost';
}



io.sockets.on('connection', function (socket) {

  console.log('connection established');

  socket.on("new room", function(data){
    rooms.push(new room(socket, data.room));


    var desktopRoom = null;
    for(var i = 0; i < rooms.length; i++){
      if(rooms[i].roomId == data.room){
        desktopRoom = i;
      }
    }
    if(desktopRoom !== null){
      console.log('new room created; room id: ' + rooms[desktopRoom].roomId);

    }

    //moblink = ":" + PORT + "/mobile.html?id=" + rooms[desktopRoom].roomId;
  });

  socket.on("connect mobile", function(data, fn){
    console.log('mobile connected');

    var desktopRoom = null;
    for(var i = 0; i < rooms.length; i++){
      if(rooms[i].roomId == data.room){
        desktopRoom = i;
      }
    }

    console.log("mobile is in room: " + desktopRoom);

    
    if(desktopRoom !== null){
      rooms[desktopRoom].mobileSockets.push(socket);
      /*
      socket.set('roomi', desktopRoom, function(){}) 
      fn({registered: true});
      rooms[socket.store.data.roomi].roomSocket.emit('add user', socket.id, data);
      */
    }else{
      fn({registered: false, error: "No live desktop connection found"});
    }
  });


  socket.on('chat message', function(msg){
    //console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

/*
  //Update the position
  socket.on("update movement", function(data){
    if(typeof socket.store.data.roomi !== 'undefined'){
      if(typeof rooms[socket.store.data.roomi] !== 'undefined'){
        rooms[socket.store.data.roomi].roomSocket.emit('update position', socket.id, data);
      }
    }
  });
*/

  //When a user disconnects
  socket.on("disconnect", function(){
    console.log("disconnect. rooms length: " + rooms.length);
    var destroyThis = null;

    if(typeof socket.store.data.roomi == 'undefined'){
      for(var i in rooms){
        if(rooms[i].roomSocket.id == socket.id){
          destroyThis = rooms[i];
        }
      }
      if(destroyThis !== null){rooms.splice(destroyThis, 1);}
      console.log(rooms.length);
    }else{
      var roomId = socket.store.data.roomi;
      for(var i in rooms[roomId].mobileSockets){
        if(rooms[roomId].mobileSockets[i] == socket){
          destroyThis = i;
        }
      }
      if(destroyThis !== null){rooms[roomId].mobileSockets.splice(destroyThis, 1);}
      rooms[roomId].roomSocket.emit('remove user', socket.id);
    }
  });
});


server.listen(PORT);

/*
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req,res){
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin' : '*'
  });
	res.sendfile('index.html');
	//res.sendfile('mobile.html');
});


io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(8080,"0.0.0.0", function(){
	console.log('listening on *:0.0.0.0:8888');
});

*/


/*
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


*/