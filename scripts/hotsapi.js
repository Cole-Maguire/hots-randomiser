const hotsApiURL = "https://hotsapi.net/api/v1/"; //hotsAPI technically has talent information, but it's unreliable, full of deprecated stuff
const heroURL = "https://raw.githubusercontent.com/heroespatchnotes/heroes-talents/master/hero/";//shortname.json
const profileImgURL = "https://raw.githubusercontent.com/heroespatchnotes/heroes-talents/master/images/heroes/";//shortname.png
const talentImgURL = "https://raw.githubusercontent.com/heroespatchnotes/heroes-talents/master/images/talents/";//icon

var heroList;

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

    const response = await fetch(hotsApiURL + "heroes/");
    const rJSON = await response.json();
    heroList = rJSON;
    return rJSON;
}


var getHero = function (hero) {
    //Get hero object for named hero, or if none is supplied, a random one.
    //Faster if a preexisting list of all objects is provided
    //Even faster if the heros name is provided as a string
    // Also accepts the index of the hero in the returned array, but don't do that as it's beyond stupid
    let shortName;

    if (heroList === undefined) {
        heroList = getHeroList();
    }


    if (typeof hero === "string") {
        shortName = heroList.filter(i => i.name === hero || i.short_name === hero)[0].short_name;
    } else {
        heroID = (hero === undefined) ? Math.floor(Math.random() * heroList.length) : hero;
        shortName = heroList[heroID].short_name;
    }
    getResponse = async () => {
        let response = await fetch(heroURL + shortName + ".json");
        return await response.json();
    }
    let z = getResponse();
    return z
}

var getEmptyLevelDict = () => {
    return { 1: [], 4: [], 7: [], 10: [], 13: [], 16: [], 20: [] };
}

var getRandTalents = function (heroID) {
    //Returns one randomly selected talent object per level 
    //Accepts hero name as a string, a hero object or nothing to return a random heros talents
    var hero = heroID;
    if (typeof heroID === 'object' && heroID !== null) {
        hero = heroID;
    } else {
        hero = getHero(heroID);
    }

    for (i in hero.talents) {
        hero.talents[i].sort((a, b) => {
            return a.sort - b.sort;
        })
    }

    let randTalents = Object.keys(hero.talents).reduce((map, t) => {
        let randTalentSort = Math.floor(Math.random() * (hero.talents[t].length));
        map[t] = hero.talents[t][randTalentSort].sort;
        return map
    }, getEmptyLevelDict());
    return [randTalents, hero.talents];
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
            console.log(j.sort === randTalents[i] ? "\t*" : "\t ", j.name);
        })
    }
}

let zz = async () => {
    await getHeroList()
    await printTalents("Azmodan");
};
