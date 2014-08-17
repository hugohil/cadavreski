var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var nodemailer = require('nodemailer');
var settings = require('./settings');

var dirnameArray = __dirname.split('/');
rootdir = dirnameArray.splice(0, dirnameArray.length - 1).join('/');

app.get('/', function (req, res) {
    res.sendfile(rootdir + '/views/index.html');
});

app.use(express.static(path.join(rootdir, '/public')));

var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(settings.config.port, function(){
    console.log('Listening on port %d', server.address().port);
});

var smtpTransport = nodemailer.createTransport("SMTP", {
    host: settings.auth.host,
    secureConnection: settings.auth.secure,
    port: settings.auth.port,
    auth: {
        user: settings.auth.addr,
        pass: settings.auth.pass
    }
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

    nextUser !== socketID ? io.to(nextUser).emit('turn') : someonesTurn = false;
};

var saveFolder = "./public/poemes/";
fs.exists(saveFolder, function (exists){
    if(!exists) fs.mkdir(saveFolder);
});

io.on('connection', function (socket){

    /*==========  CONNEXION  ==========*/   
    var socketID = socket.id;

    socket.on('login', function (u){
        socket.emit('logged');

        users.push(socketID);
        if(mailList.indexOf(u.mail) == -1) mailList.push(u.mail);

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
    socket.on('saveThis', function (save){

            title = save.isFinal ? save.poemeTitle : 'tmp';

            var escapedTitle = title.replace(/[^a-zA-Z0-9]/g,'-');
            var fileName = escapedTitle + ".txt";

            while ( fs.existsSync(saveFolder + fileName) && save.isFinal){
                fileNumber += 1;
                fileName = escapedTitle + "_" + fileNumber + ".txt";
            };

            fs.writeFile( saveFolder+fileName, poeme, function (err){
                if(err) throw err;
                else console.log('  > New poeme saved as "'+fileName+'" !');
            });

            if(save.isFinal){
                var sendPoeme = {
                    from : auth.addr,
                    to : mailList,
                    subject : title,
                    html : "<h1>Le poème est fini !</h1><br>Tu peux le lire en pièce jointe. Tu peux aussi participer encore, ou faire participer des amis !<br><h3><a href='http://cadavreski.jit.su/'>cadavreski</a></h3>",
                    text : "Le poème est fini ! Tu peux le lire en pièce jointe, participer à nouveau ou inviter des amis à participer sur http://cadavreski.jit.su/ !",
                    attachments : { filePath : saveFolder+fileName }
                }
            } else {
                var sendPoeme = {
                    from : auth.addr,
                    to : auth.addr,
                    subject : "Du nouveau sur cadavreski !",
                    text : poeme.length+' / '+poemeLength,
                    attachments : { filePath : saveFolder+fileName }
                }
            }

            smtpTransport.sendMail(sendPoeme, function (error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Message sent: " + response.message);
                }
            });

            if(save.isFinal){
                mailList.length = 0;
                poeme = '';
                poemeLength = setPoemeLength(2000,3000);
            }
    });

    socket.on('sendFriend', function (mailData){
        if (mailData.addr == '') mailData.addr = "Un joueur anonyme";
        var friendMail = {
            from : auth.addr,
            to : mailData.addr,
            subject : "Cadavreski",
            html : "Salut !<br>"+mailData.from+" t'as envoyé un lien vers <a href='http://cadavreski.jit.su/' target='_blank'>cadavreski</a>.",
            text : "Salut ! "+mailData.from+" t'as envoyé un lien vers http://cadavreski.jit.su/ ."
        };

        smtpTransport.sendMail(friendMail, function (error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent from "+mailData.from+" to : "+mailData.addr+" : " + response.message);
            }
        });
    })

    /*==========  DECONNEXION  ==========*/ 
    socket.on('disconnect', function(){
        switchUser(socketID);
        users.splice( users.indexOf(socketID) ,1);
    });

})
