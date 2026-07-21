// the entry point of the Discord bot
console.log("Server is starting...");
import("./discord/helpers.js");
import("./discord/homoglyph_map.js");
import("./foundation/server.js");
import("./foundation/discord_bot.js");
import { DiscordClient } from "./foundation/discord_bot.js";
import { Server } from "./foundation/server.js";

function shutdown() {
    console.log("Shutting down...");
    DiscordClient.destroy();
    Server.close();
    process.exit();
}

// immediately exit the process when we get the SIGTERM notification
// this ensures that old containers do not keep persisting as a new one spins up
process.on("SIGTERM", () => {
   shutdown();
});