

const puppeteer = require("puppeteer");
const fs = require("fs");
const { stringify } = require("querystring");

const products = ["Rolex", "Nike", "GUCCI"];
let results = [];
const io = require("socket.io-client");
const socket = io.connect("http://localhost:3000");


const scrape = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    

    const page = await browser.newPage();

    for (let i = 0; i < products.length; i++) {
      await page.goto("https://shopping.google.co.za/");
      await page.type(
        "input[placeholder='What are you looking for?']",
        products[i]
      );
      await page.click("button[aria-label='Google Search']");
      await page.waitForSelector("#pnnext");

      const shopurl = await page.$$eval("div.sh-dgr__grid-result a.xCpuod", (nodes) =>
        nodes.map((n) => n.getAttribute("href"))
      );

      const shopurl1 = await page.$$eval("div.sh-dgr__grid-result a.shntl", (nodes) =>
        nodes.map((n) => n.getAttribute("href"))
      );

      const pat = /^https?:\/\//i;
      let firsturl = shopurl[0];
      if (!pat.test(firsturl)) {
        firsturl = "https://www.google.co.za" + firsturl;
      }

      results.push({ name: products[i], url: firsturl });
      socket.emit("gshops", firsturl);
      
    }

    //await browser.close();
  } catch (err) {
    console.error(err);
  }
};

scrape();

