import axios from "axios";
import cheerio from "cheerio";

//取得起始頁的文章代碼
const getFirstArticleCode = async forum => {
  try {
    const ResponseHTML = await axios.get("https://www.dcard.tw/f/" + forum);
    const $ = cheerio.load(ResponseHTML.data);

    const articleCodeList = [];
    await $(".PostList_entry_1rq5Lf > div > a").each((index, value) => {
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

export default getFirstArticleCode;
