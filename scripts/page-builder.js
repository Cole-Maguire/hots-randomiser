const hotsapi = require("../scripts/hotsapi");

window.onload = async function () {
    await getHeroList();

    fillHeroSelect();
}

async function fillHeroSelect() {
    let heroSelect = document.querySelector("#hero-select");
    let randomOption = document.createElement("option");

    let heroNames = heroList.map(i => { return [i.short_name, i.name] });

    heroNames.sort();
    for (i in heroNames) {
        let heroOption = document.createElement("option");
        heroOption.value = heroNames[i][0];
        heroOption.text = heroNames[i][1];
        heroSelect.options.add(heroOption);
    }
    randomOption.text = "Random";
    heroSelect.options.add(randomOption, 0);
    heroSelect.onchange = heroSelectChange;
    heroSelect.selectedIndex = -1;
    document.querySelector("label[for=hero-select]").innerText = "Select a hero: ";
}

async function heroSelectChange() {
    let heroSelect = document.getElementById("hero-select");
    var hero = await getHero(heroSelect.value);

    changeHeroHeader(hero);
    changeHeroTalents(hero);
}

function changeHeroHeader(hero) {
    document.getElementById("hero-name-header").innerText = hero.name;
    document.getElementById("hero-image-header").src = profileImgURL + hero.shortName + ".png";
}



function changeHeroTalents(hero) {
    //remove any previously existing talents
    let talentMain = document.querySelector('#hero-talent-main');
    let matches = talentMain.querySelectorAll('.hero-level');
    matches.forEach(i => i.remove());

    //add new talents
    let tempTalents = getRandTalents(hero);
    let randTalents = tempTalents[0];
    let levelTalents = tempTalents[1];

    for (let i in levelTalents) {
        //create elements
        let levelTitle = document.createElement('h3');
        let level = document.createElement('div');
        let levelTalentDiv = document.createElement('div');

        levelTalentDiv.classList.add("hero-level-talents");
        level.onclick = changeTalentDisplay;
        level.className = "hero-level"
        levelTitle.innerText = i;
        talentMain.appendChild(level);
        level.appendChild(levelTitle);
        levelTitle.after(levelTalentDiv);

        for (let j in levelTalents[i]) {
            let talentImg = document.createElement('img');
            let talent = document.createElement('div');

            talent.innerText = levelTalents[i][j].name;
            talent.className = levelTalents[i][j].sort === randTalents[i] ? "talent-chosen" : "talent-not-chosen";
            talentImg.src = talentImgURL + levelTalents[i][j].icon
            talentImg.className = levelTalents[i][j].sort === randTalents[i] ? "talent-chosen" : "talent-not-chosen";

            levelTalentDiv.appendChild(talent);
            talent.appendChild(talentImg);
        }
    }
}
function changeTalentDisplay(e) {
    let path = e.composedPath();
    for (i in path) {
        if (path[i].matches('.hero-level')) {
            path[i].classList.toggle('talent-display-none');
            e.stopPropagation();
            return;
        }
    }
}