//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach((episode) => {
    // Create container
    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";

    // Format episode code (S02E07)
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const episodeCode = `S${season}E${number}`;

    // Title
    const title = document.createElement("h3");
    title.textContent = `${episode.name} - ${episodeCode}`;

    // Image
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = episode.name;

    // Summary (TVMaze gives HTML, so use innerHTML)
    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;

    // Append elements
    episodeCard.append(title, image, summary);

    rootElem.appendChild(episodeCard);
  });
}


window.onload = setup;
