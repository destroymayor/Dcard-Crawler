// 西斯板爬圖片
import axios from "axios";
import cheerio from "cheerio";
import path from "path";
import fs from "fs";

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

const getWebSiteContent = async (lastArticleCode, forums) => {
  try {
    const ResponseHTML = await axios.get(
      "https://www.dcard.tw/_api/forums/" + forums + "/posts?popular=false&limit=30&before=" + lastArticleCode
    );
    const $ = cheerio.load(ResponseHTML.data);
    const articleLastCode = $._root.children[$._root.children.length - 1].id;

    await $._root.children.map(item => {
      if (item.gender == "F") {
        item.media.map(mediaItem => {
          getImage(mediaItem.url);
        });
      }
    });

    await waitFor(2000);
    await getWebSiteContent(articleLastCode, forums);
  } catch (error) {
    console.log("getWebSiteContent", error);
  }
};

const getImage = async url => {
  const paths = path.resolve(
    __dirname,
    "images",
    Math.random()
      .toString(36)
      .substring(7) + ".jpg"
  );
  const getImage = await axios.get(url, {
    responseType: "stream"
  });
  await getImage.data.pipe(fs.createWriteStream(paths));
  await console.log("Save Success! ", "Time:", new Date().toTimeString().split(" ")[0]);
};

const startCrawler = () => {
  Promise.resolve()
    .then(() => getFirstArticleCode("sex"))
    .then(firstCode => getWebSiteContent(firstCode, "sex"));
};

export default startCrawler;
