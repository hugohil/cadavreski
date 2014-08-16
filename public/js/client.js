(function(){

  var socket = io.connect('http://localhost:3000');
  var username;

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
    $(".info").append('<span id="info-txt">ce n\'est pas votre tour.</span>');
  })

  /*==========  PERMISSION  ==========*/  

  var ucan;

  socket.on('turn', function(){
    if(ucan) {
      return false;
    }

    socket.emit('turnCallback');

    ucan = true;
    $('#txtarea').removeAttr('readonly');

    $('#info-txt').remove();
    $('.info').addClass('active');
  })

  /*==========  ENVOYER TEXTE  ==========*/

  $('#txtform').submit(function (event){
    event.preventDefault();

    if(ucan){
      if( $('#txtarea').val() == ''){
        alert('Il faut écrire !');
        return false;
      }else{
        socket.emit('txtsend', $('#txtarea').val()).emit('saveThis',false);
        ucan = false;
        $(".info").append('<span id="info-txt">ce n\'est pas votre tour.</span>');
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

  $('body').click(function(){
    $('#tellfriend').fadeOut(200);
  });

  $('#friendform').click(function (e){
    e.stopPropagation();
  });

  $('#friendform').submit(function (event){
    event.preventDefault();
    
    if( username == null) username = $('#yourname').val();
    
    if( $('#friendsmail').val() != '' && username != null ) {
      socket.emit("sendFriend", {addr: $('#friendsmail').val(), from: username});
    }
    $('#tellfriend').fadeOut(200);
    return false;
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
      alert('Vous devez donner un titre !');
    }else{
      socket.emit('saveThis', {poemeTitle: $('#poemetitle').val(), isFinal: true});
    }
    $('#givetitle').fadeOut(200);
    return false;
  });

})(jQuery);