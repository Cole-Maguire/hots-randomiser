const hotsapi = require("../scripts/hotsapi")
window.onload = async function () {
    await getHeroList();

    fillHeroSelect();
}

async function fillHeroSelect() {
    let heroSelect = document.getElementById("hero-select");
    let randomOption = document.createElement("option");

    let heroNames = heroList.map(i => { return [i.short_name, i.name] });

    heroNames.sort();
    for (i in heroNames) {
        let heroOption = document.createElement("option");
        heroOption.value = heroNames[i][0];
        heroOption.text = heroNames[i][1];
        heroSelect.options.add(heroOption);
    }
    randomOption.value = undefined;
    randomOption.text = "Random";
    heroSelect.options.add(randomOption, 0);
    heroSelect.onchange = heroSelectChange;
}

function heroSelectChange() {
    let heroSelect = document.getElementById("hero-select");
    var hero = getHero(heroSelect.value);

    changeHeroHeader(hero);
    changeHeroTalents(hero);
}

function changeHeroHeader(hero) {
    console.log(hero);

    document.getElementById("hero-name-header").innerText = hero.name;
    document.getElementById("hero-image-header").src = hero.icon_url["92x93"];
}

function changeHeroTalents(hero) {
    //remove any previously existing talents
    let talentMain = document.getElementById('hero-talent-main');
    let matches = document.querySelectorAll('.hero-talent-level');
    matches.forEach(i => i.remove());

    //add new talents
    let tempTalents = getRandTalents(hero);
    let randTalents = tempTalents[0];
    let levelTalents = tempTalents[1];

    for (let i in levelTalents) {
        let talentTitle = document.createElement('h3');
        let talentLevel = document.createElement('div');
        talentLevel.className = "hero-talent-level"
        talentTitle.innerText = i;
        talentMain.appendChild(talentLevel);
        talentLevel.appendChild(talentTitle);
        for (let j in levelTalents[i]) {
            let talentImg = document.createElement('img');
            let talent = document.createElement('div');

            talent.innerText = levelTalents[i][j].title;
            talent.className = levelTalents[i][j].sort === randTalents[i] ? "talent-chosen" : "talent-not-chosen";

            talentImg.height = 64;
            talentImg.width = 64;
            talentImg.src = levelTalents[i][j].icon_url["64x64"];
            talentImg.className = levelTalents[i][j].sort === randTalents[i] ? "talent-chosen" : "talent-not-chosen";
            
            talentLevel.appendChild(talentImg);
            talentLevel.appendChild(talent);
            
        }


    }

}