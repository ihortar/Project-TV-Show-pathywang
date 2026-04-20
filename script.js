let allShows = [];
let allEpisodes = [];
let currentShowId = null;

const cache = {
  shows: null,
  episodesByShowId: {},
};

function setup() {
  createPage();
  loadShows();
}

function createPage() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const controls = document.createElement("div");
  controls.className = "controls";

  const showSelect = document.createElement("select");
  showSelect.id = "show-select";

  const defaultShowOption = document.createElement("option");
  defaultShowOption.value = "";
  defaultShowOption.textContent = "Select a show...";
  showSelect.appendChild(defaultShowOption);

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  const defaultEpisodeOption = document.createElement("option");
  defaultEpisodeOption.value = "all";
  defaultEpisodeOption.textContent = "All episodes";
  episodeSelect.appendChild(defaultEpisodeOption);

  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "text";
  searchInput.placeholder = "your search term...";

  const countDisplay = document.createElement("p");
  countDisplay.id = "count-display";
  countDisplay.textContent = "Displaying 0/0 episodes.";

  const statusMessage = document.createElement("p");
  statusMessage.id = "status-message";

  const credit = document.createElement("p");
  credit.id = "credit";
  credit.innerHTML =
    'Data originally from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';

  const episodesContainer = document.createElement("div");
  episodesContainer.id = "episodes-container";

  controls.append(showSelect, episodeSelect, searchInput, countDisplay);
  rootElem.append(controls, statusMessage, episodesContainer, credit);

  showSelect.addEventListener("change", handleShowChange);
  episodeSelect.addEventListener("change", updateDisplay);
  searchInput.addEventListener("input", updateDisplay);
}

function loadShows() {
  const statusMessage = document.getElementById("status-message");

  if (cache.shows) {
    allShows = cache.shows;
    populateShowSelector(allShows);
    selectDefaultShow();
    return;
  }

  statusMessage.textContent = "Loading shows...";

  fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load shows");
      }
      return response.json();
    })
    .then((shows) => {
      allShows = shows.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );

      cache.shows = allShows;
      populateShowSelector(allShows);
      statusMessage.textContent = "";
      selectDefaultShow();
    })
    .catch((error) => {
      statusMessage.textContent = "❌ Error loading shows.";
      console.error(error);
    });
}

function populateShowSelector(showList) {
  const showSelect = document.getElementById("show-select");
  showSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a show...";
  showSelect.appendChild(defaultOption);

  showList.forEach((show) => {
    const option = document.createElement("option");
    option.value = String(show.id);
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

function selectDefaultShow() {
  const showSelect = document.getElementById("show-select");

  const defaultShow =
    allShows.find((show) => show.name.toLowerCase() === "game of thrones") ||
    allShows[0];

  if (defaultShow) {
    showSelect.value = String(defaultShow.id);
    handleShowChange();
  }
}

function handleShowChange() {
  const showSelect = document.getElementById("show-select");
  const selectedShowId = showSelect.value;

  if (!selectedShowId) {
    currentShowId = null;
    allEpisodes = [];
    resetEpisodeSelector();
    document.getElementById("search-input").value = "";
    renderEpisodes([]);
    updateCount(0, 0);
    return;
  }

  currentShowId = selectedShowId;
  document.getElementById("search-input").value = "";
  loadEpisodesForShow(selectedShowId);
}

function loadEpisodesForShow(showId) {
  const statusMessage = document.getElementById("status-message");

  if (cache.episodesByShowId[showId]) {
    allEpisodes = cache.episodesByShowId[showId];
    populateEpisodeSelector(allEpisodes);
    updateDisplay();
    return;
  }

  statusMessage.textContent = "Loading episodes...";

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }
      return response.json();
    })
    .then((episodes) => {
      cache.episodesByShowId[showId] = episodes;
      allEpisodes = episodes;
      populateEpisodeSelector(allEpisodes);
      statusMessage.textContent = "";
      updateDisplay();
    })
    .catch((error) => {
      statusMessage.textContent = "❌ Error loading episodes.";
      console.error(error);
    });
}

function populateEpisodeSelector(episodeList) {
  const episodeSelect = document.getElementById("episode-select");
  episodeSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);

  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    option.value = String(episode.id);
    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });

  episodeSelect.value = "all";
}

function resetEpisodeSelector() {
  const episodeSelect = document.getElementById("episode-select");
  episodeSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);
}

function updateDisplay() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase()
    .trim();

  const selectedEpisodeId = document.getElementById("episode-select").value;

  let filteredEpisodes = allEpisodes.filter((episode) => {
    const summaryText = episode.summary ? episode.summary.toLowerCase() : "";

    return (
      episode.name.toLowerCase().includes(searchTerm) ||
      summaryText.includes(searchTerm)
    );
  });

  if (selectedEpisodeId !== "all") {
    filteredEpisodes = filteredEpisodes.filter(
      (episode) => String(episode.id) === selectedEpisodeId
    );
  }

  renderEpisodes(filteredEpisodes);
  updateCount(filteredEpisodes.length, allEpisodes.length);

  if (selectedEpisodeId !== "all") {
    const selectedCard = document.getElementById(
      `episode-${selectedEpisodeId}`
    );

    if (selectedCard) {
      selectedCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

function updateCount(current, total) {
  const countDisplay = document.getElementById("count-display");
  countDisplay.textContent = `Displaying ${current}/${total} episodes.`;
}

function renderEpisodes(episodeList) {
  const episodesContainer = document.getElementById("episodes-container");
  episodesContainer.innerHTML = "";

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.className = "episode-card";
    card.id = `episode-${episode.id}`;

    const title = document.createElement("h2");
    title.className = "episode-title";
    title.textContent = `${episode.name} - ${getEpisodeCode(episode)}`;

    const image = document.createElement("img");
    image.className = "episode-image";
    image.src = episode.image ? episode.image.medium : "";
    image.alt = episode.name;

    const summary = document.createElement("div");
    summary.className = "episode-summary";
    summary.innerHTML = episode.summary || "<p>No summary available.</p>";

    card.append(title, image, summary);
    episodesContainer.appendChild(card);
  });
}

function getEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

window.onload = setup;