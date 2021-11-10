import clipboardy from "clipboardy";
import fs from "fs/promises";
import path from "path";
import { botId, saveCode, savePath } from "./config";

const code = `kdok js \`\`\`js
const BotDB = require("../../../../dist/lib/database/models/Bot").default;

BotDB.findOne({ id: "${botId}" }).then((bot) => {
  const length = bot.stats.length;
  bot.stats = bot.stats.filter((stat) => stat.servers);
  return bot.save().then((bot) => \`Stats: \${bot.stats.length} (Filtered: \${length - bot.stats.length})\`);
});
\`\`\``;

(async () => {
  if (saveCode) {
    try {
      await fs.access(savePath).catch(() => fs.mkdir(savePath));
    } catch (error) {
      return console.log(error);
    }
  }

  if (saveCode) await fs.writeFile(path.join(savePath, "code.txt"), code);

  console.log(code);
  clipboardy.write(code);
})();
