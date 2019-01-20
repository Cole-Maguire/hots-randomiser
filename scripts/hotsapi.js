import BigQuery from '../node_modules/@google-cloud/bigquery';
// const fetch = require('node-fetch');


// require('dotenv').config();

const hotsApiURL = 'https://hotsapi.net/api/v1/'; // hotsAPI technically has talent information, but it's unreliable, full of deprecated stuff
const heroURL = 'https://raw.githubusercontent.com/heroespatchnotes/heroes-talents/master/hero/';// shortname.json
const profileImgURL = 'https://raw.githubusercontent.com/heroespatchnotes/heroes-talents/master/images/heroes/';// shortname.png
const talentImgURL = 'https://raw.githubusercontent.com/heroespatchnotes/heroes-talents/master/images/talents/';// icon

let heroList;

async function getBigQueryStats(heroName, talents) {
  // Creates a client
  const bigquery = new BigQuery();
  // BigQuery doesn't support StoredProcs, which is very annoying.
  const query = `  
  -- OVERALL
  SELECT
    'Overall' as stat_type,
    COUNT(players) AS num_games,
    COUNTIF(players.winner = TRUE) AS won,
    AVG(score.hero_damage) AS avg_hero_dmg,
    AVG(score.siege_damage) AS avg_siege_dmg,
    AVG(CAST(IFNULL(CAST(score.healing AS STRING),
          '0')AS INT64)+CAST(IFNULL(CAST(score.self_healing AS STRING),
          '0')AS INT64) ) AS avg_heal
  FROM
    \`hots-randomiser.hotsapi_eu.replays\` AS replays,
    UNNEST(players) AS players,
    UNNEST(score) AS score
  WHERE
    players.hero LIKE @heroName
    
  UNION ALL
  
  -- PLAYER ON HERO
  SELECT
    'Player' as stat_type,
    COUNT(players) AS num_games,
    COUNTIF(players.winner = TRUE) AS won,
    AVG(score.hero_damage) AS avg_hero_dmg,
    AVG(score.siege_damage) AS avg_siege_dmg,
    AVG(CAST(IFNULL(CAST(score.healing AS STRING),
          '0')AS INT64)+CAST(IFNULL(CAST(score.self_healing AS STRING),
          '0')AS INT64) ) AS avg_heal
  FROM
    \`hots-randomiser.hotsapi_eu.replays\` AS replays,
    UNNEST(players) AS players,
    UNNEST(score) AS score
  WHERE
    players.hero LIKE @heroName
    AND players.battletag_name LIKE @battletag_name
    
  UNION ALL
  
    -- FILTERED
  SELECT
    'Filtered' as stat_type,
    COUNT(players) AS num_games_f,
    COUNTIF(players.winner = TRUE) AS won,
    AVG(score.hero_damage) AS avg_hero_dmg,
    AVG(score.siege_damage) AS avg_siege_dmg,
    AVG(CAST(IFNULL(CAST(score.healing AS STRING),
          '0')AS INT64)+CAST(IFNULL(CAST(score.self_healing AS STRING),
          '0')AS INT64) ) AS avg_heal
  FROM
    \`hots-randomiser.hotsapi_eu.replays\` AS replays,
    UNNEST(players) AS players,
    UNNEST(score) AS score
  WHERE
    (players.talents._1 LIKE @talent1)
    AND (players.talents._4 LIKE @talent4
      OR players.talents._4 IS NULL)
    AND (players.talents._7 LIKE @talent7
      OR players.talents._7 IS NULL)
    AND (players.talents._10 LIKE @talent10
      OR players.talents._10 IS NULL)
    AND (players.talents._13 LIKE @talent13
      OR players.talents._13 IS NULL)
    AND (players.talents._16 LIKE @talent16
      OR players.talents._16 IS NULL)
    AND (players.talents._20 LIKE @talent20
      OR players.talents._20 IS NULL)`;

  const options = {
    query,
    useLegacySql: false, // must be standard sql to run paramterised queries
    params: {
      heroName,
      talent1: talents[1],
      talent4: talents[4],
      talent7: talents[7],
      talent10: talents[10],
      talent13: talents[13],
      talent16: talents[16],
      talent20: talents[20],
      battletag_name: localStorage.getItem('battletag'),
    },
    location: 'EU',
  };

  return bigquery.query(options);
}
async function getHeroList() {
  // Returns an object containing all heroes

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
