import axios from "axios";
import cheerio from "cheerio";

import { exportResults, fs_writeFile } from "./src/exportResult"; //讀寫檔案 function
import { waitFor } from "./src/delayFunction"; //延遲執行

//取得起始頁的文章代碼
const getFirstArticleCode = async (forum) => {
    try {
        const firstArticleCodeList = [];
        const ResponseHTML = await axios.get("https://www.dcard.tw/f/" + forum);
        const $ = cheerio.load(ResponseHTML.data);

        await $(".PostList_wrapper_2BLUM > a").map((index, value) => {
            const ArticleCode = value.attribs.href.match(new RegExp("f\\/" + forum + "\\/p\\/\\d+", "g"))[0].replace("f/" + forum + "/p/", "")
            firstArticleCodeList.push(ArticleCode);
        });

        return firstArticleCodeList[firstArticleCodeList.length - 1];
    } catch (error) {
        console.log('getFirstArticleCode Error', error);
    }
};

//取得文章最後的id
const getLastArticleCode = async (code) => {
    try {
        const ResponseHTML = await axios.get("https://www.dcard.tw/_api/forums/3c/posts?popular=false&limit=30&before=" + code);
        const $ = cheerio.load(ResponseHTML.data);

        return $._root.children[$._root.children.length - 1].id;
    } catch (error) {
        console.log('getLastArticleCode Error', error);
    }
};

const getWebSiteContent = async (lastArticleCode, forums, output) => {
    try {
        const crawlerList = [];
        const ResponseHTML = await axios.get("https://www.dcard.tw/_api/forums/" + forums + "/posts?popular=false&limit=30&before=" + lastArticleCode);
        const $ = cheerio.load(ResponseHTML.data);
        const articleLastCode = $._root.children[$._root.children.length - 1].id

        $._root.children.map(item => {
            crawlerList.push({
                id: item.id,
                article_title: item.title,
                content: item.excerpt,
                school: item.school
            });
        });

        await exportResults(crawlerList, output);
        await console.log(articleLastCode, new Date().toString());

        await waitFor(5000); //延遲後執行
        await Promise.resolve().then(() => getLastArticleCode(articleLastCode)).then((lastCode) => {
            getWebSiteContent(lastCode, forums, output);
        });
    } catch (error) {
        console.log('getWebSiteContent Error', error)
    }

};

const StartCrawler = async (forum) => {
    const forums = forum;
    const outputPath = "./output/" + forum + ".json";
    //預先創建一個json來儲存資料
    fs_writeFile(outputPath, JSON.stringify([]), (err) => {
        if (err) console.log("write", err);
    });

    Promise.resolve().then(() => getFirstArticleCode(forum))
        .then((firstCode) => {
            getLastArticleCode(firstCode)
                .then(lastCode => { getWebSiteContent(lastCode, forums, outputPath); });
        }).catch(error => {
            console.log('StartCrawler Error', error)
        });
}

export default StartCrawler;
