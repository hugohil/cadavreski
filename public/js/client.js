var host = document.domain;
var port = (host !== 'localhost') ? 80 : 3000;

var socket = io.connect('http://' + host + ':' + port);
var username;

(function(){
  /*==========  LOGIN  ==========*/
  $('#loginform').submit(function (event){
    event.preventDefault();
    socket.emit('login', { name : $('#username').val(), mail : $('#usermail').val() } );
    if( $('#username').val() != '' ) username = $('#username').val();
    return false;
  });

  socket.on('logged', function(){
    $('#login').fadeOut(500, function(){
      $("#txt").fadeIn(500);
      $('#fold').fadeIn(500);
    });
    $('#txtarea').focus();
  })

  /*==========  PERMISSION  ==========*/
  var ucan;

  socket.on('turn', function(){
    if(ucan) return false;

    socket.emit('turnCallback');

    ucan = true;
    $('#txtarea').removeAttr('readonly');

    // $('#info-txt').remove();
    $("#info-txt").html('Vous pouvez écrire.');
    $('.info').addClass('active');
  })

  /*==========  ENVOYER TEXTE  ==========*/
  $('#txtform').submit(function (event){
    event.preventDefault();

    if(ucan){
      if( $('#txtarea').val() == ''){
        printMessage('Il faut écrire !');
        return false;
      }else{
        socket.emit('txtsend', $('#txtarea').val()).emit('saveThis',false);
        ucan = false;
        $("#info-txt").html('Ce n\'est pas votre tour.');
        $(".info").removeClass("active");
      }
      $('#txtarea').attr('readonly','true');
      $('#txtarea').val('');
      return false;
    }

  })

  /*==========  RECEVOIR TEXTE  ==========*/
  socket.on('receptxt', function (words){
    console.log(words);

    $('#lastmsg').remove();

    var verses = [];
    var limit = 1;

    $('#fold').append('<div id="lastmsg"></div>');
    for(i=0; i < words.length; i++){
      if( words[i] != null) {
        $('#lastmsg').append('<span> '+ words[i] +'</span>');
      }
    }

  })

  /*==========  FAIRE TOURNER  ==========*/
  socket.on('tellFriend', function(){
    if( username != null ) $('#yourname').hide();
   
    $('#tellfriend').fadeIn(500);
  })

  $('#friendform').click(function (e){
    e.stopPropagation();
  });

  $('#friendform').submit(function (event){
    event.preventDefault();
    
    if( username == null) username = $('#yourname').val();
    
    if( $('#friendsmail').val() != '' && username != null ) {
      socket.emit("sendFriend", {to: $('#friendsmail').val(), from: username});
    }
    $('#tellfriend').fadeOut(200);
    printMessage('Votre invitation a bien été envoyée.');
  })

  /*==========  DONNER UN TITRE  ==========*/
  socket.on('finishHim', function(){
    $("#givetitle").fadeIn(500);
  });

  $('body').click(function(){
    $('#givetitle').fadeOut(200);
  });

  $('#titleform').click(function (e){
    e.stopPropagation();
  });
  
  $('#titleform').submit(function (event){
    event.preventDefault();

    if($('#poemetitle').val() == ''){
      printMessage('Vous devez donner un titre !');
    } else {
      socket.emit('finished', $('#poemetitle').val());
    }
    $('#givetitle').fadeOut(200);
  });

  /*==========  UTILITIES  ==========*/
  function printMessage(message) {
    $('#message .content').html(message);
    $('#message').fadeIn(500);
    window.setTimeout(function(){
      clearMessage(500)
    }, 4000);
  }

  function clearMessage(delay){
    console.log('clearing !');
    $('#message').fadeOut(delay, function(){
      $('#message .content').empty();
    });
  }

  $('body').click(function (event){
    if($('#tellfriend').css('display') !== 'none' || $('#message').css('display') !== 'none'){
      $('#tellfriend').fadeOut(200);
      clearMessage(200);
    }
  });

})(jQuery);