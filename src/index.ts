import clipboardy from "clipboardy";
import fs from "fs/promises";
import path from "path";
import { botId, dataFile, differenceFilter, saveCode, saveFiltered, savePath, showFiltered } from "./config";
import { BotStat } from "./types";

let filteredDates: number[] = [];
let filtered: { filtered: BotStat; prev: BotStat }[] = [];

fs.readFile(dataFile, {
  encoding: "utf-8",
}).then(async (raw) => {
  const data = JSON.parse(raw) as BotStat[];
  await awaitFilter(data);

  const code = `kdok js \`\`\`js
const BotDB = require("../../../../dist/lib/database/models/Bot").default;

const removeDate = [${filteredDates.join(", ")}];

BotDB.findOne({ id: "${botId}" }).then((bot) => {
  const length = bot.stats.length;
  bot.stats = bot.stats.filter((stat) => !removeDate.includes(new Date(stat.updated).getTime()));
  return bot.save().then((bot) => \`Stats: \${bot.stats.length} (Filtered: \${length - bot.stats.length})\`);
});
\`\`\``;

  if (saveFiltered || saveCode) {
    try {
      await fs.access(savePath).catch(() => fs.mkdir(savePath));
    } catch (error) {
      return console.log(error);
    }
  }

  if (saveFiltered) await fs.writeFile(path.join(savePath, "result.json"), JSON.stringify(filtered, null, 2));

  if (saveCode) await fs.writeFile(path.join(savePath, "code.txt"), code);

  console.log(code);
  clipboardy.write(code);
});

async function filter(data: BotStat[]) {
  let index = 0;
  let currentFiltered: { filtered: BotStat; prev: BotStat }[] = [];
  for await (const stat of data) {
    if (index === data.length) break;

    const prevData = data[data.findIndex((value) => value === stat) - 1];
    if (!prevData) continue;

    if (prevData.servers - stat.servers > differenceFilter) {
      const filterRes = { filtered: stat, prev: prevData };
      filtered.push(filterRes);
      currentFiltered.push(filterRes);
      if (showFiltered) console.log(filterRes);
    }

    index++;
  }

  for await (const filterData of currentFiltered) {
    const data = new Date(filterData.filtered.updated).getTime();
    if (filteredDates.includes(data)) continue;
    else filteredDates.push(data);
  }

  return currentFiltered;
}

const awaitFilter = (data: BotStat[]) =>
  new Promise(async (resolve) => {
    while (true) {
      const result = await filter(data.filter((value) => !filtered.map((globalFilter) => globalFilter.filtered).includes(value)));

      if (result.length === 0) return resolve(null);
      console.log(`Filtered: ${filtered.length} (Current: ${result.length})`);
    }
  });
