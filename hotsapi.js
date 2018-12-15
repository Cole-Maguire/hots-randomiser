const baseUrl = "https://hotsapi.net/api/v1/";
const fetch = require('node-fetch');

var printAbilities = async function (heroID) {
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


let getHero = async function (hero) {
    //Get hero object for named hero, or if none is supplied, a random one.
    // Also accepts the index of the hero in the returned array, but don't do that as it's beyond stupid
    const getHeroes = async function () {
        const response = await fetch([baseUrl, "heroes/", typeof hero === "string" ? hero + "/" : ""].join(""));
        return response.json()
    };
    let heroJSON = await getHeroes()
    if (typeof hero === "string") {
        return heroJSON;
    } else if (hero === undefined) {
        heroID = Math.floor(Math.random() * heroJSON.length);
    } else {
        heroID = hero
    };
    return await heroJSON[heroID]; //Is there a way to make this object better defined?
}

let getEmptyLevelDict = () => {
    return { 1: [], 4: [], 7: [], 10: [], 13: [], 16: [], 20: [] };
}

let getRandTalents = async function (heroID) {
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
        console.log("Level",i);
        levelTalents[i].map(j => {
            console.log(j.sort === randTalents[j.level] ? "\t*" : "\t ", j.title);
        })
    }


}
printTalents();

