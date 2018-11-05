import axios from "axios";
import cheerio from "cheerio";

import { exportResults, writeFileAsync } from "./src/exportResult"; //讀寫檔案 function
import delay from "./src/delay"; //延遲執行
import getFirstArticleCode from "./src/getFirstArticleCode"; //取得起始頁的文章代碼

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

    await delay(2000);
    await getWebSiteContent(articleLastCode, forums, output);
  } catch (error) {
    console.log("getWebSiteContent", error);
  }
};

const startCrawler = forum => {
  const outputPath = "./output/" + forum + ".json";
  writeFileAsync(outputPath, []);
  Promise.resolve()
    .then(() => getFirstArticleCode(forum))
    .then(firstCode => getWebSiteContent(firstCode, forum, outputPath));
};

export default startCrawler;
