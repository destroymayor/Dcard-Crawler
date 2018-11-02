import axios from "axios";
import cheerio from "cheerio";

import { exportResults, fsWriteFile } from "./src/exportResult"; //讀寫檔案 function

const waitFor = ms => new Promise(r => setTimeout(r, ms)); //延遲執行

//取得起始頁的文章代碼
const getFirstArticleCode = async forum => {
  try {
    const ResponseHTML = await axios.get("https://www.dcard.tw/f/" + forum);
    const $ = cheerio.load(ResponseHTML.data);

    const articleCodeList = [];
    await $(".PostList_wrapper_2BLUM > a").each((index, value) => {
      const ArticleCode = $(value)
        .attr("href")
        .match(new RegExp("f\\/" + forum + "\\/p\\/\\d+", "g"))[0]
        .replace("f/" + forum + "/p/", "");
      articleCodeList.push(ArticleCode);
    });

    return articleCodeList[articleCodeList.length - 1];
  } catch (error) {
    console.log("getFirstArticleCode Error", error);
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
        content: item.excerpt,
        school: item.school
      });
    });

    await exportResults(crawlerList, output);

    await waitFor(2000);
    await getWebSiteContent(articleLastCode, forums, output);
  } catch (error) {
    console.log("getWebSiteContent", error);
  }
};

const startCrawler = async forum => {
  const outputPath = "./output/" + forum + ".json";
  fsWriteFile(outputPath, JSON.stringify([]), err => {
    if (err) console.log("write", err);
  });

  Promise.resolve()
    .then(() => getFirstArticleCode(forum))
    .then(firstCode => getWebSiteContent(firstCode, forum, outputPath));
};

export default startCrawler;
