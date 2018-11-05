// 西斯板爬圖片
import axios from "axios";
import cheerio from "cheerio";
import path from "path";
import fs from "fs";

import delay from "./src/delay";
import getFirstArticleCode from "./src/getFirstArticleCode";

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

    await delay(2000);
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

  try {
    const getImageRequest = await axios.get(url, {
      responseType: "stream"
    });
    await getImageRequest.data.pipe(fs.createWriteStream(paths));
    await console.log("Save Success! ", "Time:", new Date().toTimeString().split(" ")[0]);
  } catch (error) {
    console.log("TCL: }catch -> error", error);
  }
};

const startCrawler = () => {
  Promise.resolve()
    .then(() => getFirstArticleCode("sex"))
    .then(firstCode => getWebSiteContent(firstCode, "sex"));
};

export default startCrawler;
