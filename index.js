const startCrawler = require("./crawler");
const crawler_sex = require("./crawler_sex");
const program = require("commander");

const forum = (value, dummyPrevious) => value;

program.option("-f, --forum <string>", "論壇代碼", forum).parse(process.argv);

if (program.forum !== undefined) {
  console.log(`論壇代碼 ${program.forum}`);
  startCrawler(program.forum);
}
