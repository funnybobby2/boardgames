let games = [];

function fillModalContent(data){
  let content = document.getElementById('modal-content');

  let people = "";
  if(data.nbUserMin === data.nbUserMax && data.nbUserMin === 1){
    people = "<i class='icon-user-1'></i> Solo";
  }
  if(data.nbUserMin === data.nbUserMax && data.nbUserMin === 2){
    people = "<i class='icon-users-1'></i> Duel";
  }
  if(data.nbUserMin !== data.nbUserMax){
    people = `<i class='icon-users-1'></i> De ${data.nbUserMin} à ${data.nbUserMax}`;
  }

  content.innerHTML = `<div class='card'>
      <div class='picture'>
        <img src='./assets/${data.img}' />
      </div>
      <div class='info'>
        <h1 class='title'>${data.title}</h1>
        <div class='rate'></div>
        <div class='summary'>${data.resume}</div>
        <div class='tags'>
          <div class='tag duration'><i class="icon-stopwatch-1"></i> ${data.duration} min</div>
          <div class='tag age'>A partir de ${data.ageMin} ans</div>
          <div class='tag people'>${people}</div>
        </div>
      </div>
    </div>`;
}

function searchGames(event){
  let query = event.srcElement.value.toLowerCase();

  if(query.length > 2){
    let filteredGames = games.filter(g => {
      return (g.title.toLowerCase().includes(query) || g.group.toLowerCase().includes(query))
    });
    displayGames(filteredGames);
  } else displayGames(games);
}

function customSort(a, b) {
  if(a.group === "" && b.group !== ""){
    return b.group.localeCompare(a.title);
  } else if(b.group === "" && a.group !== ""){
    return a.group.localeCompare(b.title);
  } else if((a.group === "" && b.group === "") || (a.group !== "" && b.group !== "" && a.group === b.group)){
    return a.title.localeCompare(b.title);
  } else if(a.group !== "" && b.group !== "" && a.group !== b.group){
    return a.group.localeCompare(b.group);
  }
}

function setGames(data){
  games = data.sort(customSort);
}

function displayGames(games){
  // Sélectionner l'élément div conteneur
  const container = document.getElementById('container');
  container.innerHTML = "";

  // Parcourir chaque objet dans le tableau
  games.forEach(obj => {
    // Créer une nouvelle balise div pour chaque objet
    const divContainer = document.createElement('div');
    divContainer.classList.add('itemContainer');

    const div = document.createElement('div');
    div.classList.add('item');
    if(obj.isPlayed) div.classList.add('played')
    div.addEventListener("click", function (e) {
      fillModalContent(obj);
      document.getElementById('callMyModal').click();
    });

    const img = document.createElement('img');
    img.src = `./assets/${obj.img}`;
    img.alt = obj.title;

    div.appendChild(img);
    divContainer.appendChild(div);

    // Ajouter la balise div au conteneur
    container.appendChild(divContainer);
  });
}

function loadGames(){
  // Charger le fichier JSON
  fetch('data.json')
  .then(response => response.json())
  .then(data => {
    // tri des données
    games = setGames(data.games);
    displayGames(games);
  })
  .catch(error => console.error('Une erreur s\'est produite :', error));
}