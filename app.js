// the entry point of the Discord bot
console.log("Server is starting...");
require("./foundation/server");
require("./foundation/discord_bot");
require("./discord/helpers");
const fs = require("fs");

// activate discord goals and behaviors
async function activate_discord_goals() {
    fs.readdir('./discord/goals/', (err, files) => {
        for (const file_path of files) {
            require("./discord/goals/" + file_path);
        }
    });
}
async function activate_discord_behaviors() {
    fs.readdir('./discord/behaviors/', (err, files) => {
        for (const file_path of files) {
            require("./discord/behaviors/" + file_path);
        }
    });
}

activate_discord_goals();
activate_discord_behaviors();