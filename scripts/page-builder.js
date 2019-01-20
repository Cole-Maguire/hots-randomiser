import * as Chart from '../node_modules/chart.js';
/* global profileImgURL, getRandTalents,getBigQueryStats,
getHero,heroList,talentImgURL,getHeroList */
/* The fact that ESLint doesn't pick up anything from hotsapi.js is infintely annoying */

// import * as hotsapi from '../scripts/hotsapi.js';


let wrChart;
let dmgChart;

// Chart Functions
function removeChartData(chart) {
  chart.data.datasets.forEach((dataset) => {
    while (dataset.data.length !== 0) {
      dataset.data.pop();
    }
  });
  chart.update();
}

function updateChartData(chart, dataIn) {
  chart.data.datasets.forEach((dataset, i) => {
    dataIn.datasets[i].data.forEach(j => dataset.data.push(j));
  });
  chart.update();
}

function drawWRChart(filtered, overall) {
  const ctx = document.getElementById('chart-winrate');
  const chartData = {
    labels: [
      'Wins',
      'Losses',
    ],
    datasets: [{
      label: 'This Hero',
      data: [overall.won, overall.num_games - overall.won],
      backgroundColor: [
        '#00dd00',
        '#dd0000',
      ],
      hoverBackgroundColor: [
        '#00cc00',
        '#cc0000',
      ],
    }, {
      label: 'This Build',
      data: [filtered.won, filtered.num_games - filtered.won],
      backgroundColor: [
        '#00ff00',
        '#ff0000',
      ],
      hoverBackgroundColor: [
        '#00ee00',
        '#ee0000',
      ],
    }],
  };

  const options = {
    responsive: false,
    maintainAspectRatio: false,
    title: {
      display: true,
      text: 'Wins vs Losses',
    },
    legend: {
      display: true,
    },
    tooltips: {
      callbacks: {
        label: (item, data) => {
          // Override tooltip to show percentages and which build we're on
          const set = data.datasets[item.datasetIndex].label; // dataset
          const label = data.labels[item.index];
          const value = data.datasets[item.datasetIndex].data[item.index];
          // Breaking up percent calculation for readability.
          // Add up the data in the dataset
          const sum = data.datasets[item.datasetIndex].data.reduce((total, num) => total + num);
          const percent = (value / sum * 100).toFixed(2);
          return `${set} ${label}: ${percent}% with ${value} games`;
        },
      },
    },
  };

  if (wrChart === undefined) {
    wrChart = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options,
    });
  } else {
    removeChartData(wrChart);
    updateChartData(wrChart, chartData); // TODO
  }
}

function drawDmgChart(filtered, overall, player) {
  const ctx = document.getElementById('chart-dmg');
  const chartData = {
    labels: [
      'This Hero',
      'This Build',
      'You on this Hero',
    ],
    datasets: [{
      label: 'Hero Damage',
      data: [overall.avg_hero_dmg, filtered.avg_hero_dmg, player.avg_hero_dmg],
      backgroundColor: [
        '#aa0000',
        '#ff0000',
        '#990000',
      ],
    },
    {
      label: 'Siege Damage',
      data: [overall.avg_siege_dmg, filtered.avg_siege_dmg, player.avg_siege_dmg],
      backgroundColor: [
        '#00aa00',
        '#00ff00',
        '#009900',
      ],
    },
    {
      label: 'Healing',
      data: [overall.avg_heal, filtered.avg_heal, player.avg_heal],
      backgroundColor: [
        '#0000aa',
        '#0000ff',
        '#000099',
      ],
    },
    ],
  };

  const options = {
    responsive: false,
    maintainAspectRatio: false,
    title: {
      display: true,
      text: 'Damage and Healing Statistics',
    },
    legend: {
      display: true,
    },
    scales: {
      xAxes: [{
        stacked: true,
      }],
      yAxes: [{
        stacked: true,
      }],
    },
  };

  if (dmgChart === undefined) {
    dmgChart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options,
    });
  } else {
    removeChartData(dmgChart);
    updateChartData(dmgChart, chartData); // TODO
  }
}
async function drawCharts(rowsIn) {
  const [rows] = await rowsIn;

  const [filtered] = rows.filter(i => i.stat_type === 'Filtered');
  const [overall] = rows.filter(i => i.stat_type === 'Overall');
  const [player] = rows.filter(i => i.stat_type === 'Player');

  drawWRChart(filtered, overall, player);
  drawDmgChart(filtered, overall, player);
}


// Changing Heroes - DOM
function setBattletag() {
  localStorage.setItem('battletag', document.querySelector('#battletag-input').value);
}

function getBattletagDefault() {
  const localTemp = localStorage.getItem('battletag')
  if (localTemp != null) {
    document.querySelector('#battletag-input').value = localTemp;
  }
}
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
  const talentMain = document.querySelector('#hero-talent-main');

  // add new talents
  const [randTalents, levelTalents] = getRandTalents(hero);

  // remove any previously existing talents
  function removeOldTalents() {
    const matches = talentMain.querySelectorAll('.hero-level');
    matches.forEach(i => i.remove());
  }
  removeOldTalents();

  Object.entries(levelTalents).forEach(([talentLevel, talentObj]) => {
    // Create elements
    const levelTitle = document.createElement('h3');
    const levelDiv = document.createElement('div');
    const talentDiv = document.createElement('div');

    // Add them to DOM
    talentMain.appendChild(levelDiv);
    levelDiv.appendChild(levelTitle);
    levelTitle.after(talentDiv);
    talentDiv.classList.add('hero-level-talents');

    // Edit Title/container
    levelDiv.onclick = changeTalentDisplay;
    levelDiv.className = 'hero-level';
    levelTitle.innerText = talentLevel;

    Object.values(talentObj).forEach((j) => { // Keys are meaningless for this subobject
      const talentImg = document.createElement('img');
      const talentText = document.createElement('div');
      // Set talentText
      talentText.innerText = j.name;
      talentText.className = j.talentTreeId === randTalents[talentLevel] ? 'talent-chosen' : 'talent-not-chosen';
      talentText.title = j.talentTreeId;
      // Set talentImg. j.icon is the name of the file, not the file itself, fwiw
      talentImg.src = talentImgURL + j.icon;
      talentImg.className = j.talentTreeId === randTalents[talentLevel] ? 'talent-chosen' : 'talent-not-chosen';

      talentDiv.appendChild(talentText);
      talentText.appendChild(talentImg);
    });
  });
  // Get stats and draw chart
  drawCharts(getBigQueryStats(hero.name, randTalents));
}
async function heroSelectChange() {
  const heroSelect = document.getElementById('hero-select');
  const hero = await getHero(heroSelect.value);
  setBattletag();
  changeHeroHeader(hero);
  changeHeroTalents(hero);
}

// Initialise Page - DOM
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
  getBattletagDefault();
};
