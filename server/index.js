var express = require('express');
var app = express();
var path = require('path');
var settings = require('./settings');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(settings.auth.API_KEY);

var dirnameArray = __dirname.split('/');
rootdir = dirnameArray.splice(0, dirnameArray.length - 1).join('/');

app.get('/', function (req, res) {
    res.sendfile(rootdir + '/views/index.html');
});

app.use(express.static(path.join(rootdir, '/public')));

var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(settings.port, function(){
    console.log('Listening on port %d', server.address().port);
});

var poeme = '';
var mailList = [];
var users = [];
var someonesTurn;
var fileNumber = 0;
function setPoemeLength(min, max) {
    var theLength = Math.floor( Math.random() * (max - min) + min );
    console.log("Poeme length set to %s characters.", theLength);
    return theLength;
};
var poemeLength = setPoemeLength(2000,3000);

var lastwords = [];
function switchUser(socketID) {
    var myPos = users.indexOf(socketID);
    var next = myPos + 1;
    if(next >= users.length) next = 0;
    var nextUser = users[next];

    (nextUser !== socketID) ? io.to(nextUser).emit('turn') : someonesTurn = false;
};

io.on('connection', function (socket){

    /*==========  CONNEXION  ==========*/   
    var socketID = socket.id;

    socket.on('login', function (u){
        socket.emit('logged');

        users.push(socketID);
        if(mailList.indexOf(u.mail) == -1 && u.mail.length > 1) mailList.push(u.mail);

        if(users.length <= 1 || !someonesTurn) socket.emit('turn');
        if(lastwords.length > 0) socket.emit('receptxt', lastwords);

        console.log('> ' + users.length + ' users');
        console.log("> users : " + users);
        console.log(mailList);
    });

    /*==========  TOURS  ==========*/
    socket.on('turnCallback', function(){
        someonesTurn = true;
    })

    var asked = false;

    socket.on('txtsend', function (msg){

        poeme += " "+ msg;

        lastwords.length = 0;
        
        var txtArray = msg.split(' ');
        for(var i = txtArray.length-2; i < txtArray.length; i++){
            lastwords.push(txtArray[i]);
        }

        socket.broadcast.emit('receptxt', lastwords);

        console.log("   > users : "+users);
        
        switchUser(socketID);

        if(poeme.length > poemeLength) {
            socket.emit('finishHim');
        } else if( !asked ) {
            socket.emit('tellFriend');
            asked = true;
        }
    })

    /*==========  PARTAGE  ==========*/ 
    socket.on('finished', function (title){
        mandrill_client.messages.send({
            "message": {
                "html": 'hello',
                "text": 'hello',
                "subject": 'Cadavreski - ' + title,
                "from_email": settings.auth.sender,
                "to":[{
                    "email": mailList
                }],
                "attachments": [{
                    "type": 'text/plain',
                    "name": title,
                    "content": new Buffer(poeme).toString('base64'),
                }]
            }
        }, function (result) {
            console.log(result);
            mailList.length = 0;
            poeme = '';
            poemeLength = setPoemeLength(2000,3000);
        }, function (e) {
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        });
    });

    socket.on('sendFriend', function (data){
        mandrill_client.messages.send({
            "message": {
                "html": 'hello from ' + data.from,
                "text": 'hello from ' + data.from,
                "subject": 'Cadavreski',
                "from_email": settings.auth.sender,
                "to":[{
                    "email": data.to
                }]
            }
        }, function (result) {
            console.log(result);
        }, function (e) {
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        });
    })

    /*==========  DECONNEXION  ==========*/ 
    socket.on('disconnect', function(){
        switchUser(socketID);
        users.splice( users.indexOf(socketID) ,1);
    });

})


