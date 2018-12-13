const baseUrl = "https://hotsapi.net/api/v1/";
const fetch = require('node-fetch');

//Get hero object for named, or if none is supplied, a random one
let getHero = async function (hero) {
    const getHeroes = async function () {
        const response = await fetch([baseUrl, "heroes/", typeof hero === "string" ? hero + "/" : ""].join(""));
        return response.json()
    };
    let heroJSON = await getHeroes()
    if (typeof hero === "string") {
        return await heroJSON;
    } else if (hero === undefined) {
        randID = Math.floor(Math.random() * heroJSON.length);
    };
    return await heroJSON[randID];
}

let getEmptyLevelDict = () => {
    return { 1: [], 4: [], 7: [], 10: [], 13: [], 16: [], 20: [] };
}

let printAbilities = async function (heroID) {
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
};

let getRandTalents = async function (heroID) {
//Returns one randomly selected talent object per level 
    let hero = await getHero(heroID);

    console.log(hero.name)
    console.log("Role: " + hero.role + " Type: " + hero.type);

    let levelTalents = hero.talents.reduce((map, talent) => {
        map[talent.level].push(talent);
        return map;
    }, getEmptyLevelDict());

    let randTalents = Object.entries(levelTalents).reduce((map, talents) => {
        randID = Math.floor(Math.random() * (talents[1].length));
        map[talents[0]] = talents[1][randID];
        return map
    }, getEmptyLevelDict());
    return getRandTalents;
}

getRandTalents("Jaina");

