var electron = require('electron')
var BrowserWindow = electron.BrowserWindow;
const { app, ipcMain, ipdRenderer } = electron;
const puppeteer = require('puppeteer');
const delay = require('delay');
const cheerio = require('cheerio')

let accounts = ['hopresellgame@gmail.com:Winslow65one', 'dylanmaloy97@gmail.com:Winslow65one'];


function createMain() {
    win = new BrowserWindow({ width: 500, height: 400, resizable: false, frame: false });
    win.loadFile('./html/main.html');
    //win.webContents.openDevTools();
}

app.on('ready', createMain);

ipcMain.on('start', function () {
    console.log('starting')
    return startTask();
});

ipcMain.on('stop', function () {
    console.log('stopping')
    app.quit();
});

function startTask() {
    for (var i = 0; i < accounts.length; i++) {
        let arr = accounts[i].split(':');
        login(arr);
    }
}

async function login(arr) {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--window-size=0,0'
          ]
    });
    const page = await browser.newPage();
    await page.goto('https://accounts.google.com/signin/v2/identifier?hl=en&service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Ffeature%3Dsign_in_button%26hl%3Den%26app%3Ddesktop%26next%3D%252F%26action_handle_signin%3Dtrue&passive=true&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin');
    await page.type('#identifierId', arr[0], { delay: 5 });
    await page.click('#identifierNext')
    await page.waitForSelector('#password input[type="password"]', { visible: true });
    await page.type('#password input[type="password"]', arr[1], { delay: 30 })
    await page.click('#passwordNext');
    await delay(3000);
    let cookies = await page.cookies();
    console.log(arr[0] + ' successfully logged in')
    browser.close();
    setInterval( () => {
        getVid(cookies);
        getSearch(cookies);
    }, 20000);
}

async function getVid(cookies) {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    for (var i = 0; i < cookies.length; i++) {
        await page.setCookie(cookies[i]);
    }

    await page.goto('https://www.youtube.com');
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    let $ = cheerio.load(bodyHTML);
    let link = $('#video-title').attr('href');
    await page.goto('http://youtube.com' + link);
    console.log('http://youtube.com' + link);
    setTimeout( () => {
        browser.close();
    }, 15000);

}

async function getSearch(cookies) {

    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    for (var i = 0; i < cookies.length; i++) {
        await page.setCookie(cookies[i]);
    }

    let common = ["the","of","and","a","to","in","is","you","that","it","he","was","for","on","are","as","with","his","they","I","at","be","this","have","from","or","one","had","by","word","but","not","what","all","were","we","when","your","can","said","there","use","an","each","which","she","do","how","their","if","will","up","other","about","out","many","then","them","these","so","some","her","would","make","like","him","into","time","has","look","two","more","write","go","see","number","no","way","could","people","my","than","first","water","been","call","who","oil","its","now","find","long","down","day","did","get","come","made","may","part"];

    await page.goto('https://www.google.com/')  
    let data = common[getRandomInt(100)] + ' ' + common[getRandomInt(100)];
    await page.type('input.gsfi', data);
    await page.keyboard.press('Enter');
    await page.waitForSelector('#resultStats');
    console.log('Searched ' + data);
    browser.close();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  
