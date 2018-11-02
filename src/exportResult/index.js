import fs from "fs";
import util from "util";
const fsWriteFile = util.promisify(fs.writeFileSync);

// read file async
const readFileAsync = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

// file write
const exportResults = (parsedResults, coverFile) => {
  readFileAsync(coverFile)
    .then(data => {
      const jsonData = JSON.parse(data);
      parsedResults.map(item => {
        jsonData.push(item);
      });

      fsWriteFile(coverFile, JSON.stringify(jsonData, null, 2), err => {
        if (err) console.log("write", err);
      });

      console.log("Save Success! length:", jsonData.length, ", Time:", new Date().toTimeString().split(" ")[0]);
    })
    .catch(err => {});
};

export { exportResults, readFileAsync, fsWriteFile };
