import clipboardy from "clipboardy";
import fs from "fs/promises";
import path from "path";
import { botId, saveCode, savePath } from "./config";

const code = `kdok js \`\`\`js
const { MessageAttachment } = require("discord.js");
const BotDB = require("../../../../dist/lib/database/models/Bot").default;

const id = "${botId}";

BotDB.findOne({ id }).then((data) => {
  const split = Math.ceil(data.stats.length / 2);
  const first = data.stats.splice(0, split);
  const second = data.stats.splice(-split);

  message.channel.send({
    files: [new MessageAttachment(Buffer.from(JSON.stringify(first, null, 2)), \`result-\${id}-1.json\`)]
  });
  message.channel.send({
    files: [new MessageAttachment(Buffer.from(JSON.stringify(second, null, 2)), \`result-\${id}-2.json\`)]
  });
});

("\\u200b");
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
