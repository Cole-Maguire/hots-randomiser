const fetch = require('node-fetch');
// Only required for runnning on Node. Browser consoles should support fetch natively.

const hotsApiURL = 'https://hotsapi.net/api/v1/'; // hotsAPI technically has talent information, but it's unreliable, full of deprecated stuff
const heroURL = 'https://raw.githubusercontent.com/heroespatchnotes/heroes-talents/master/hero/';// shortname.json
const profileImgURL = 'https://raw.githubusercontent.com/heroespatchnotes/heroes-talents/master/images/heroes/';// shortname.png
const talentImgURL = 'https://raw.githubusercontent.com/heroespatchnotes/heroes-talents/master/images/talents/';// icon

let heroList;

async function getHeroList() {
  // Returns anobject containing all heroes

  const response = await fetch(`${hotsApiURL}heroes/`);
  const rJSON = await response.json();
  heroList = rJSON; // Writes to the global heroList object
  return rJSON;
}


function getHero(hero) {
  // Get hero object for named hero, or if none is supplied, a random one.
  // Faster if a preexisting list of all objects is provided
  // Even faster if the heros name is provided as a string
  let shortName;

  function getRandHero() {
    const heroID = Math.floor(Math.random() * heroList.length);
    return heroList[heroID].short_name;
  }


  if (heroList === undefined) {
    heroList = getHeroList();
  }


  if (hero === 'Random') {
    shortName = getRandHero();
  } else if (typeof hero === 'string') {
    shortName = heroList.filter(i => i.name === hero || i.short_name === hero)[0].short_name;
  } else {
    shortName = getRandHero();
  }
  async function getResponse() {
    const response = await fetch(`${heroURL + shortName}.json`);
    return response.json();
  }
  const z = getResponse();
  return z;
}

function getEmptyLevelDict() {
  return {
    1: [], 4: [], 7: [], 10: [], 13: [], 16: [], 20: [],
  };
}

function getRandTalents(heroID) {
  // Returns one randomly selected talent object per level
  // Accepts hero name as a string, a hero object or nothing to return a random heros talents
  let hero = heroID;
  if (typeof heroID === 'object' && heroID !== null) {
    hero = heroID;
  } else {
    hero = getHero(heroID);
  }

  // Get talents in the correct order for ease of use (sort property provided by API)
  Object.entries(hero.talents).forEach(i => i.sort((a, b) => a.sort - b.sort));

  const randTalents = Object.keys(hero.talents).reduce((map, t) => {
    // Get a random talent, based on the sort property
    const randTalentSort = Math.floor(Math.random() * (hero.talents[t].length));
    map[t] = hero.talents[t][randTalentSort].talentTreeId;
    return map;
  }, getEmptyLevelDict());
  return [randTalents, hero.talents];
}

// const zz = async () => {
//     await getHeroList();
//     await printTalents('Azmodan');
// };
