var API_ROOT_URL = "http://192.168.203.13:8080/api/v1";

$("#usernameInput").val(localStorage.getItem('username'));

$.ajax(
  `${API_ROOT_URL}/get_machine_list`,
  {dataType: 'json'}
).done(function(data) {
  console.log(data);
});

function changeGameMode() {
  var gameMode = document.getElementById("modeSelect").value;
  if (gameMode == 1) {
    $("#AIcarousel").css("display", "none");
    $("#userRecord").css("display", "block");
  }
  else {
    $("#AIcarousel").css("display", "block");
    $("#userRecord").css("display", "none");
  }
}

function startGame() {
  if ($("#usernameInput").val().trim()) {
    var gameMode = document.getElementById("modeSelect").value;
    switch(gameMode) {
      case "1":
        window.location.href = "game_human.html";
        break;
      case "2":
        window.location.href = "game_human_ai.html";
        break;
      case "3":
        window.location.href = "game_ai_human.html";
        break;
      default:
        break;
    }

    localStorage.setItem('username', $("#usernameInput")[0].value);
  }
  else {
    alert ('Please enter your name');
  }
}