require('../scripts/hotsapi');

function changeHeroHeader(hero) {
  document.getElementById('hero-name-header').innerText = hero.name;
  document.getElementById('hero-image-header').src = `${profileImgURL + hero.shortName}.png`;
}
function changeTalentDisplay(e) {
  const path = e.composedPath();
  Object(path).keys.forEach((i) => {
    if (i.matches('.hero-level')) {
      path[i].classList.toggle('talent-display-none');
      e.stopPropagation();
    }
  });
}

async function drawWRChart(rowsIn) {
  const [[rows]] = await rowsIn; // Need to destructure two levels
  const data = new google.visualization.arrayToDataTable([
    ['Build', 'winrate'],
    // toFixed returns str, so convert with parseFloat.
    // || 0 to handle NaNs if num_games/count_winner is 0
    ['Overall', parseFloat((100 * rows.count_winner_o / rows.num_games_o).toFixed(2)) || 0],
    ['This Build', parseFloat((100 * rows.count_winner_f / rows.num_games_f).toFixed(2)) || 0],
  ]);

  const options = {
    title: 'Winrate',
    width: 400,
    hAxis: {
      viewWindow: {
        min: 0,
        max: 100,
      },
    },
  };
  const chart = new google.visualization.BarChart(document.querySelector('#chart-winrate'));
  chart.draw(data, options);
}

function changeHeroTalents(hero) {
  const talentMain = document.querySelector('#hero-talent-main');

  // add new talents
  const [randTalents, levelTalents] = getRandTalents(hero);

  // remove any previously existing talents
  function removeOldTalents() {
    const matches = talentMain.querySelectorAll('.hero-level');
    matches.forEach(i => i.remove());
  }
  removeOldTalents();

  Object.entries(levelTalents).forEach(([talentLevel, talentObj]) => {
    // Create elements
    const levelTitle = document.createElement('h3');
    const levelDiv = document.createElement('div');
    const talentDiv = document.createElement('div');

    // Add them to DOM
    talentMain.appendChild(levelDiv);
    levelDiv.appendChild(levelTitle);
    levelTitle.after(talentDiv);
    talentDiv.classList.add('hero-level-talents');

    // Edit Title/container
    levelDiv.onclick = changeTalentDisplay;
    levelDiv.className = 'hero-level';
    levelTitle.innerText = talentLevel;

    Object.values(talentObj).forEach((j) => { // Keys are meaningless for this subobject
      const talentImg = document.createElement('img');
      const talentText = document.createElement('div');
      // Set talentText
      talentText.innerText = j.name;
      talentText.className = j.talentTreeId === randTalents[talentLevel] ? 'talent-chosen' : 'talent-not-chosen';
      talentText.title = j.talentTreeId;
      // Set talentImg. j.icon is the name of the file, not the file itself, fwiw
      talentImg.src = talentImgURL + j.icon;
      talentImg.className = j.talentTreeId === randTalents[talentLevel] ? 'talent-chosen' : 'talent-not-chosen';

      talentDiv.appendChild(talentText);
      talentText.appendChild(talentImg);
    });
  });
  // Get stats and draw chart
  drawWRChart(getBigQueryStats(hero.name, randTalents));
}

async function heroSelectChange() {
  const heroSelect = document.getElementById('hero-select');
  const hero = await getHero(heroSelect.value);

  changeHeroHeader(hero);
  changeHeroTalents(hero);
}

async function fillHeroSelect() {
  const heroSelect = document.querySelector('#hero-select');
  const randomOption = document.createElement('option');
  const heroNames = heroList.map(i => [i.short_name, i.name]);

  heroNames.sort();
  heroNames.forEach((i) => {
    const heroOption = document.createElement('option');
    [heroOption.value, heroOption.text] = i;
    heroSelect.options.add(heroOption);
  });
  randomOption.text = 'Random';
  heroSelect.options.add(randomOption, 0);
  heroSelect.onchange = heroSelectChange;
  heroSelect.selectedIndex = -1;
  document.querySelector('label[for=hero-select]').innerText = 'Select a hero: ';
}

window.onload = async () => {
  await getHeroList();
  fillHeroSelect();
};
