const baseUrl = "https://hotsapi.net/api/v1/";
const fetch = require('node-fetch'); //Only required for runnning on Node. Browser consoles should support fetch natively.

var printAbilities = async function (heroID) {
    //Debug
    // Print a summary of the heroes abilities, and what talents they provide
    let hero = await getHero(heroID);
    console.log(hero.name)
    console.log("Role: " + hero.role + " Type: " + hero.type);
    for (let i in hero.abilities) {
        console.log("\t" + hero.abilities[i].title);
        let ability = hero.abilities[i].name;

        for (let j in hero.talents) {
            if (hero.talents[j].ability === ability) {
                console.log("\t\t" + hero.talents[j].title + " Level: " + hero.talents[j].level);
            }
        }
    }
}

var getHeroList = async function () {
    //Returns anobject containing all heroes

    const response = await fetch(baseUrl + "heroes/");
    const responseJSON = await response.json();
    return responseJSON;
}


var getHero = async function (hero, heroList) {
    //Get hero object for named hero, or if none is supplied, a random one.
    //Faster if a preexisting list of all objects is provided
    //Even faster if the heros name is provided as a string
    // Also accepts the index of the hero in the returned array, but don't do that as it's beyond stupid
    if (typeof hero === "string") {
        let response = await fetch([baseUrl, "heroes/", hero].join(""));
            return response.json();

    } else {
        let heroJSON;
        if (heroList === undefined) {
            heroList = await getHeroList()
        }

        heroID = (hero === undefined) ? Math.floor(Math.random() * heroJSON.length) : hero;

        return await heroJSON[heroID];
    } //Is there a way to make this object better defined?
}

var getEmptyLevelDict = () => {
    return { 1: [], 4: [], 7: [], 10: [], 13: [], 16: [], 20: [] };
}

var getRandTalents = async function (heroID) {
    //Returns one randomly selected talent object per level 
    //Accepts hero name as a string, a hero object or nothing to return a random heros talents
    let hero
    if (typeof heroID === 'object' && heroID !== null) {
        hero = heroID;
    } else {
        hero = await getHero(heroID);
    }

    let levelTalents = hero.talents.reduce((map, talent) => {
        map[talent.level].push(talent);
        return map;
    }, getEmptyLevelDict());

    for (i in levelTalents) {
        levelTalents[1].sort((a, b) => {
            return a.sort - b.sort
        })
    }

    let randTalents = Object.entries(levelTalents).reduce((map, talents) => {
        heroID = Math.floor(Math.random() * (talents[1].length));
        map[talents[0]] = talents[1][heroID].sort;
        return map
    }, getEmptyLevelDict());
    return [randTalents, levelTalents];
}
var printTalents = async function (heroID) {
    let hero = await getHero(heroID);
    let tempTalents = await getRandTalents(hero);

    let randTalents = tempTalents[0];
    let levelTalents = tempTalents[1];
    console.log(hero.name);
    console.log("Role: " + hero.role + " Type: " + hero.type);

    for (i in levelTalents) {
        console.log("Level", i);
        levelTalents[i].map(j => {
            console.log(j.sort === randTalents[j.level] ? "\t*" : "\t ", j.title);
        })
    }
}

