const axios = require("axios");
const cheerio = require("cheerio");

const { exportResults, writeFileAsync } = require("./src/exportResult"); //讀寫檔案 function
const delay = require("./src/delay"); //延遲執行

//取得起始頁的文章代碼
const getFirstArticleCode = async forum => {
  try {
    const ResponseHTML = await axios.get("https://www.dcard.tw/f/" + forum);
    const $ = cheerio.load(ResponseHTML.data);
    const articleCodeList = [];
    await $("#root > div > div > div > div > main > div > div > div > a").each((index, value) => {
      const ArticleCode = $(value)
        .attr("href")
        .match(new RegExp("f\\/" + forum + "\\/p\\/\\d+", "g"))[0]
        .replace("f/" + forum + "/p/", "");
      articleCodeList.push(ArticleCode);
    });
    return articleCodeList[articleCodeList.length - 1];
  } catch (error) {
    console.log("getFirstArticleCode Error", error.Error);
  }
};

const getWebSiteContent = async (lastArticleCode, forums, output) => {
  try {
    const ResponseHTML = await axios.get(
      "https://www.dcard.tw/_api/forums/" + forums + "/posts?popular=false&limit=30&before=" + lastArticleCode
    );
    const $ = cheerio.load(ResponseHTML.data);
    const articleLastCode = $._root.children[$._root.children.length - 1].id;

    const crawlerList = [];
    $._root.children.map(item => {
      crawlerList.push({
        id: item.id,
        article_title: item.title,
        content: item.excerpt
      });
    });

    await exportResults(crawlerList, output);

    await delay(Math.floor(Math.random() * (5000 - 10000 + 1) + 10000));
    await getWebSiteContent(articleLastCode, forums, output);
  } catch (error) {
    // console.log("getWebSiteContent", error);
  }
};

const startCrawler = forum => {
  const outputPath = "./output/" + forum + ".json";
  writeFileAsync(outputPath, []);
  Promise.resolve()
    .then(() => getFirstArticleCode(forum))
    .then(firstCode => getWebSiteContent(firstCode, forum, outputPath));
};

module.exports = startCrawler;
