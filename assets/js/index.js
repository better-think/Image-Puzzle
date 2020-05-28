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
}