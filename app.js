// the entry point of the Discord bot
console.log("Server is starting...");
require("./foundation/server");
require("./foundation/discord_bot");
require("./discord/helpers");
const fs = require("fs");

// activate discord goals
async function activate_discord_goals() {
    fs.readdir('./discord/goals/', (err, files) => {
        for (const file_path of files) {
            require("./discord/goals/" + file_path);
        }
    });
}
activate_discord_goals();