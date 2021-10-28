import clipboardy from "clipboardy";
import fs from "fs/promises";
import path from "path";
import { botId, saveCode, savePath } from "./config";

const code = `kdok js \`\`\`js
const { MessageAttachment } = require("discord.js");
const BotDB = require("../../../../dist/lib/database/models/Bot").default;

const id = "${botId}";

BotDB.findOne({ id }).then((data) =>
  message.channel.send({
    files: [
      new MessageAttachment(
        Buffer.from(JSON.stringify(data.stats, null, 2)),
        \`result-\${id}.json\`
      ),
    ],
  })
);

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
