const http = require('http');
const { app, BrowserWindow } = require('electron');

const hostname = '127.0.0.1';
const port = 3000;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  win.loadFile('html/index.html')

}

app.on('ready', createWindow)