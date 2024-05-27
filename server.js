const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const antibot = require('./serverside-antibot.js');
const bodyParser = require('body-parser');

 


puppeteer.use(stealthPlugin());
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

console.clear();
console.log('\x1B[1m\x1B[4mSTICKER LIVE SERVER\x1B[0m \x1B[1m\x1B[2m/|\\ ^._.^ /|\\ \x1B[0m\n\n');

const log = ( str, color = { r: 0, g: 0, b: 0 } )=>{
  console.log(`\x1B[1m[server]\x1B[0m \x1B[38;2;${color.r};${color.g};${color.b}m${str}\x1b[0m`);
}

const newPuppetChrome = async ( url )=>{
    const browser = await puppeteer.launch({ 
      headless: false, 
      devtools: true,
      args:['--start-maximized' ],
      defaultViewport: null,
    });
  
    let [page] = await browser.pages();
    if( !page )
      page = await browser.newPage();
    await page.goto( url );
  
    fs.watch(path.join(__dirname, '../'), {
      recursive: false,
    }, ()=>{
        page.reload()
    })
    return browser;
}

// Allow cross-origin requests
app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      // Set Cross-Origin-Opener-Policy header
      //res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      // Set Cross-Origin-Embedder-Policy header
      //res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
});
app.use(express.static(path.join(__dirname, '../')));

antibot.setupAntiBot(app, path)

// Start the server
const server = app.listen(PORT, async () => {
      
      log("opening web page with chrome...", {
        r: 51,
        g: 204,
        b: 255,
      })

      const browser = await newPuppetChrome(`http://localhost:${PORT}`)
      const close = () => {
        console.clear();
        log('server closed', { r: 255, g: 10, b: 50 })
        browser.close();
        server.close();
      }

      log(`server is running on port ${PORT}`,{
        r: 51,
        g: 204,
        b: 255,
      });
      log(`http://localhost:${PORT}`, {
        r: 0,
        g: 102,
        b: 255,
      })
      log('watching for file changes...', {
        r: 102,
        g: 0,
        b: 255,
      })

      console.log('\n\x1B[1m\x1b[47m\x1B[38;2;255;0;255m PRESS ANY KEY TO EXIT \x1B[0m' );
      process.on('SIGINT', close )
      process.on('SIGQUIT', close );
      process.on('SIGTERM', close );
      process.on('exit', close );

      process.stdin.on('data', close );
      process.stdin.on('error', ()=>{
        close();
      })
});
