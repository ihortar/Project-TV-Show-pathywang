function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading episodes...</p>";

  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }
      return response.json();
    })
    .then((allEpisodes) => {
      buildPage(allEpisodes);
    })
    .catch((error) => {
      rootElem.innerHTML =
        "<p>❌ Error loading episodes. Please try again later.</p>";
      console.error(error);
    });

  function buildPage(allEpisodes) {
    rootElem.innerHTML = "";

    const pageWrapper = document.createElement("div");
    pageWrapper.className = "page-wrapper";

    const controlsWrapper = document.createElement("div");
    controlsWrapper.className = "controls-wrapper";

    const selector = document.createElement("select");
    selector.id = "episode-selector";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.id = "search-input";
    searchInput.placeholder = "Search episodes...";

    const countDisplay = document.createElement("p");
    countDisplay.id = "count-display";

    const credit = document.createElement("p");
    credit.innerHTML =
      'Data originally from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';

    const episodesContainer = document.createElement("div");
    episodesContainer.id = "episodes-container";

    // ===== DROPDOWN DEFAULT OPTION =====
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All episodes";
    selector.appendChild(allOption);

    // ===== FILL DROPDOWN =====
    allEpisodes.forEach((episode) => {
      const option = document.createElement("option");
      option.value = episode.id;
      option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
      selector.appendChild(option);
    });

    // ===== RENDER FUNCTION =====
    function renderEpisodes(episodeList) {
      episodesContainer.innerHTML = "";

      episodeList.forEach((episode) => {
        const episodeCard = document.createElement("div");
        episodeCard.className = "episode-card";
        episodeCard.id = `episode-${episode.id}`;

        const title = document.createElement("h3");
        title.textContent = `${episode.name} - ${getEpisodeCode(episode)}`;

        const image = document.createElement("img");
        image.src = episode.image ? episode.image.medium : "";
        image.alt = episode.name;

        const summary = document.createElement("div");
        summary.innerHTML = episode.summary || "";

        episodeCard.append(title, image, summary);
        episodesContainer.appendChild(episodeCard);
      });
    }

    // ===== UPDATE DISPLAY =====
    function updateDisplay() {
      const searchTerm = searchInput.value.toLowerCase();
      const selectedValue = selector.value;

      let filteredEpisodes = allEpisodes.filter((episode) => {
        return (
          episode.name.toLowerCase().includes(searchTerm) ||
          (episode.summary && episode.summary.toLowerCase().includes(searchTerm))
        );
      });

      if (selectedValue !== "all") {
        filteredEpisodes = filteredEpisodes.filter(
          (episode) => String(episode.id) === selectedValue
        );
      }

      countDisplay.textContent =
        `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes`;

      renderEpisodes(filteredEpisodes);

      // scroll to selected episode
      if (selectedValue !== "all") {
        const selectedCard = document.getElementById(
          `episode-${selectedValue}`
        );

        if (selectedCard) {
          selectedCard.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    }

    // ===== EVENTS =====
    selector.addEventListener("change", updateDisplay);
    searchInput.addEventListener("input", updateDisplay);

    // ===== INITIAL LOAD =====
    updateDisplay();

    // ===== APPEND TO DOM =====
    controlsWrapper.append(selector, searchInput, countDisplay, credit);
    pageWrapper.append(controlsWrapper, episodesContainer);
    rootElem.appendChild(pageWrapper);
  }
}

function getEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

window.onload = setup;