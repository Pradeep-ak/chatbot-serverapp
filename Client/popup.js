
MAX_CHATS = 35;
//HOST_NAME='127.0.0.1:5000';
HOST_NAME='sre.jcpenney.com:5000';
var faq = [
  "Who is on the shift from SRE Team ?",
  "What is today SRE Team shift ?",
  "Please provide details of the SRE Team Member <FristName>",
  "What is todays date and time now ?",
  "Inventory status: <Sku_number/PP_ID>",
  "Pulsar Capacity: <over_all/store_number> <yyyyMMdd>",
  "Price Detail: <PP_ID>",
  "JOB: <job_id>",
  "PP Details: <PP_ID>",
  "Jira Issue: <jira_ID>",
  "Jira: <jira_ID> ad_c <Comments>",
  "What are my SRE stories ?",
  "What are my PBI stories ?",
  "What is today traffic distribution ?",
  "Product Price : <ProductId>"
];

document.addEventListener('DOMContentLoaded', function() {
  autocomplete(document.getElementById("myInput"), faq);
  loadOldMessage();

  document.getElementById('faqForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var q = document.getElementById("myInput").value;
    addMeChat(q);
    addtoDB('m', q);
    var j = localStorage.getItem('jsession')
    document.getElementById("myInput").value = 'Replying......';
    $.ajax({ 
      type: 'POST', 
      url: 'http://'+HOST_NAME+'/chatbot/faq', 
      data: {q:q, j:j}, 
      // dataType: 'json',
      success: function (data) { 
        addUChat(data);
        addtoDB('u', data);
      },
      error: function(jqXHR, exception) {
        console.debug(jqXHR); 
        console.debug(exception);
        document.getElementById("myInput").value = 'Error (We are in Beta version).. Please clear ME and Ask next Question.';
      }
  });
  }, false);

  document.getElementById('toggle').addEventListener('click', function(e){
    e.preventDefault();
    var display = document.getElementById("chatWindow").style.display;
    if(display === 'none'){
      document.getElementById("chatWindow").style.display='block';
      document.getElementById("accWindow").style.display='none';
    }else{
      document.getElementById("chatWindow").style.display='none';
      document.getElementById("accWindow").style.display='block';
      paintAccWindow();
    }
  }, false);

  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('login')
    var u = document.getElementById("username").value;
    var p = document.getElementById("password").value;
    if(u.length > 0 && p.length > 0){
      $.ajax({ 
        type: 'POST', 
        url: 'http://'+HOST_NAME+'/chatbot/login', 
        data: {u:u,p:p}, 
        dataType: 'json',
        success: function (data) { 
          if(data.hasOwnProperty('jsession')){
            localStorage.setItem('jsession', data['jsession']);
            paintAccWindow();
          } else{
            document.getElementById('errorMsg').innerHTML='<span style="color:red">We are unable to validate you. Please try after some time.</span>'
          }
        },
        error: function(jqXHR, exception) {
          console.debug(jqXHR); 
          console.debug(exception);
          document.getElementById('errorMsg').innerHTML='<span style="color:red">Unable to connect to server.</span>'
        }
      });
    }
  }, false);
  
  document.getElementById('logout').addEventListener('click', function(e){
    e.preventDefault();
    localStorage.removeItem('jsession')
    document.getElementById("loginSec").style.display='block';
    document.getElementById("AccSec").style.display='none';
  }, false);

}, false);

function addUChat(data) {
  document.getElementById("myInput").value = '';
  var youchat= '<label><b>SRE Team: </b></label><span>$$InnerHTML$$</span>';
  updateChatConverstions(youchat, data, 'youChat');
  var div = document.getElementById('chatsection');
  div.scrollTop = div.scrollHeight - div.clientHeight;
}

function addMeChat(data) {
  var mechat = '<label><b>Me: </b></label><span>$$InnerHTML$$</span>';
  updateChatConverstions(mechat, data, 'meChat');
}

function updateChatConverstions(html,data, className){
  var mechatupdated = html.replace('$$InnerHTML$$', data);
    a = document.createElement("DIV");
    a.setAttribute("class", className);
    a.innerHTML = mechatupdated;
    document.getElementById("chatsection").appendChild(a);
}

function nowInepoch(){
  return new Date().getTime()/1000.0;
}

function loadOldMessage(){
  var chatStr = localStorage.getItem('chat');
  var jsonObj = {}
  if(chatStr != null && chatStr.length > 0){
    jsonObj = JSON.parse(chatStr)
    var keys = Object.keys(jsonObj).sort()
    keys.forEach(e => {
      console.log(e)
      if (jsonObj[e]['c'] === 'm'){
        addMeChat(jsonObj[e]['d']);
      } else{
        addUChat(jsonObj[e]['d']);
      }
    });
  }
}

function addtoDB(chatType, data) {
  var chatStr = localStorage.getItem('chat');
  var jsonObj = {}
  if(chatStr != null && chatStr.length > 0){
    jsonObj = JSON.parse(chatStr)
  }
  substr = {}
  substr ['c'] = chatType
  substr ['d'] = data
  jsonObj [nowInepoch()]= substr
  jsonObj = removeOldChat(jsonObj);
  localStorage.setItem('chat', JSON.stringify(jsonObj));
}

function removeOldChat(jsonObj){
  var keys = Object.keys(jsonObj).sort()
  if (keys.length > MAX_CHATS){
    for(i=0; i < (keys.length-MAX_CHATS);i++){
      delete jsonObj[keys[i]];
    }
  }
  return jsonObj;
}

function paintAccWindow(){
  if(localStorage.getItem('jsession') != null){
    document.getElementById("loginSec").style.display='none';
    document.getElementById("AccSec").style.display='block';
  }
}



