const hotsapi = require("../scripts/hotsapi")
window.onload = async function () {
    var heroList = getHeroList();

    fillHeroSelect(heroList);
}

async function fillHeroSelect(heroListIn) {
    let heroList = await heroListIn;
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
    heroSelect.onchange = changeHeroHeader;
}

async function changeHeroHeader(){
    let heroSelect = document.getElementById("hero-select");
    let hero = await getHero(heroSelect.value);
    console.log(hero);

    document.getElementById("hero-name-header").innerText = hero.name;
    document.getElementById("hero-image-header").src = hero.icon_url["92x93"];
}