document
  .getElementById("nicknameForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const nickname = document.getElementById("nickname").value.trim();

    if (nickname) {
      localStorage.setItem("playerNickname", nickname); // Enregistrer le pseudonyme dans le localStorage
      window.location.href = "/html/game.html"; // Rediriger vers la page du jeu
    }
  });
