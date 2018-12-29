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

function changeHeroTalents(hero) {
  // remove any previously existing talents
  const talentMain = document.querySelector('#hero-talent-main');
  const matches = talentMain.querySelectorAll('.hero-level');
  matches.forEach(i => i.remove());

  // add new talents
  const [randTalents, levelTalents] = getRandTalents(hero);

  Object.keys(levelTalents).forEach((i) => {
    // create elements
    const levelTitle = document.createElement('h3');
    const level = document.createElement('div');
    const levelTalentDiv = document.createElement('div');

    levelTalentDiv.classList.add('hero-level-talents');
    level.onclick = changeTalentDisplay;
    level.className = 'hero-level';
    levelTitle.innerText = i;
    talentMain.appendChild(level);
    level.appendChild(levelTitle);
    levelTitle.after(levelTalentDiv);

    Object.keys(levelTalents[i]).forEach((j) => {
      const talentImg = document.createElement('img');
      const talent = document.createElement('div');

      talent.innerText = levelTalents[i][j].name;
      talent.className = levelTalents[i][j].talentTreeId === randTalents[i] ? 'talent-chosen' : 'talent-not-chosen';
      talent.title = levelTalents[i][j].talentTreeId;
      talentImg.src = talentImgURL + levelTalents[i][j].icon;
      talentImg.className = levelTalents[i][j].talentTreeId === randTalents[i] ? 'talent-chosen' : 'talent-not-chosen';

      levelTalentDiv.appendChild(talent);
      talent.appendChild(talentImg);
    });
  });
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
