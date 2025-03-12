const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let snake;
let apple;
let score;
let gameStarted = false;
let gameInterval;

const instructionsPopup = document.getElementById("instructionsPopup");
const closeInstructionsBtn = document.getElementById("closeInstructionsBtn");

let hasSeenInstructions = localStorage.getItem("hasSeenInstructions");

(function setup() {
  snake = new Snake();
  apple = new Apple();
  score = 0;

  document.addEventListener("keydown", handleKeydown); // Attendre la première touche
  document.getElementById("restartBtn").addEventListener("click", restartGame);
  document
    .getElementById("resetLeaderboardBtn")
    .addEventListener("click", resetLeaderboard);

  loadLeaderboard();

  if (!hasSeenInstructions) {
    instructionsPopup.style.display = "block";
  }

  instructionsPopup.style.display = "block";
})();

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snake.move();
  snake.draw();
  apple.draw();

  if (snake.eat(apple)) {
    apple.pickLocation();
    score++;
    document.getElementById("score").textContent = score;
  }

  if (snake.collide() || snake.outsideBounds()) {
    endGame();
  }
}

function Snake() {
  this.snakeArray = [{ x: 10, y: 10 }];
  this.direction = "RIGHT";

  this.draw = function () {
    ctx.fillStyle = "#2ecc71";
    this.snakeArray.forEach((segment, index) => {
      ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
      if (index === 0) {
        ctx.fillStyle = "#27ae60";
      }
    });
  };

  this.move = function () {
    let head = { ...this.snakeArray[0] };

    switch (this.direction) {
      case "UP":
        head.y--;
        break;
      case "DOWN":
        head.y++;
        break;
      case "LEFT":
        head.x--;
        break;
      case "RIGHT":
        head.x++;
        break;
    }

    this.snakeArray.unshift(head);
    this.snakeArray.pop();
  };

  this.changeDirection = function (event) {
    if (event.keyCode === 37 && this.direction !== "RIGHT") {
      this.direction = "LEFT";
    } else if (event.keyCode === 38 && this.direction !== "DOWN") {
      this.direction = "UP";
    } else if (event.keyCode === 39 && this.direction !== "LEFT") {
      this.direction = "RIGHT";
    } else if (event.keyCode === 40 && this.direction !== "UP") {
      this.direction = "DOWN";
    }
  };

  this.eat = function (apple) {
    if (this.snakeArray[0].x === apple.x && this.snakeArray[0].y === apple.y) {
      this.snakeArray.push({});
      return true;
    }
    return false;
  };

  this.collide = function () {
    let snakeHead = this.snakeArray[0];
    for (let i = 1; i < this.snakeArray.length; i++) {
      if (
        snakeHead.x === this.snakeArray[i].x &&
        snakeHead.y === this.snakeArray[i].y
      ) {
        return true;
      }
    }
    return false;
  };

  this.outsideBounds = function () {
    let head = this.snakeArray[0];
    return head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows;
  };
}

function Apple() {
  this.x = 0;
  this.y = 0;

  this.draw = function () {
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(this.x * scale, this.y * scale, scale, scale);
  };

  this.pickLocation = function () {
    this.x = Math.floor(Math.random() * columns);
    this.y = Math.floor(Math.random() * rows);
  };
}

function handleKeydown(event) {
  if (!gameStarted) {
    gameStarted = true;
    gameInterval = setInterval(gameLoop, 100); // Start game loop
    instructionsPopup.style.display = "none"; // Hide instructions
    localStorage.setItem("hasSeenInstructions", "true"); // Mark instructions as seen
  }

  snake.changeDirection(event);
}

closeInstructionsBtn.addEventListener("click", function () {
  instructionsPopup.style.display = "none";
  localStorage.setItem("hasSeenInstructions", "true");
});

function endGame() {
  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameOverPopup").style.display = "block";
  saveScore(score);
}

function restartGame() {
  clearInterval(gameInterval); // Stop previous game loop
  gameStarted = false; // Reset game state
  snake = new Snake();
  score = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("gameOverPopup").style.display = "none";

  // Reset instructions and show the popup
  localStorage.removeItem("hasSeenInstructions");
  instructionsPopup.style.display = "block";
}

// Leaderboard Functions
function generateRandomId() {
  return "player-" + Math.random().toString(36).substring(2, 7);
}

function saveScore(newScore) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  const playerIndex = leaderboard.findIndex((entry) => entry.id === playerId);

  if (playerIndex !== -1) {
    leaderboard[playerIndex].score = newScore;
  } else {
    leaderboard.push({ id: playerId, score: newScore });
  }

  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 8); // Keep top 7 players

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  loadLeaderboard();
}

// Récupérer le pseudonyme du joueur
const playerNickname =
  localStorage.getItem("playerNickname") || "Joueur Anonyme"; // Valeur par défaut si rien n'est trouvé
let playerId = playerNickname; // Le playerId sera désormais le pseudonyme du joueur

// Partie de code existante pour gérer les scores et le leaderboard
function saveScore(newScore) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  const playerIndex = leaderboard.findIndex((entry) => entry.id === playerId);

  if (playerIndex !== -1) {
    leaderboard[playerIndex].score = newScore;
  } else {
    leaderboard.push({ id: playerId, score: newScore });
  }

  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 7); // Garder les 7 meilleurs joueurs

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  loadLeaderboard();
}

function loadLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  let leaderboardList = document.getElementById("leaderboardList");
  leaderboardList.innerHTML = ""; // Réinitialiser la liste des classements

  leaderboard.forEach((entry, index) => {
    let li = document.createElement("li");

    // Ajouter des emojis en fonction de la position
    let medal = "";
    if (index === 0) {
      medal = "🥇"; // Or
      li.classList.add("gold");
    } else if (index === 1) {
      medal = "🥈"; // Argent
      li.classList.add("silver");
    } else if (index === 2) {
      medal = "🥉"; // Bronze
      li.classList.add("bronze");
    }

    li.textContent = `${medal} ${index + 1}. ${entry.id} : ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

function resetLeaderboard() {
  localStorage.removeItem("leaderboard");
  loadLeaderboard();
}

document
  .getElementById("changeNicknameBtn")
  .addEventListener("click", function () {
    window.location.href = "pseudonyme.html"; // Rediriger vers la page de pseudonyme
  });
