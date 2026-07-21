// starts the discord bot
let discord_token = process.env.DISCORD_TOKEN;
if (!discord_token) {
    throw new Error('Discord token is not provided as an environment variable!');
}
import fs from "fs";
import { fork } from 'child_process';

import {Client, GatewayIntentBits} from 'discord.js';
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
client.login(discord_token).then(r => {
    console.log("Bot successfully logged in discord!");

    // activate discord goals and behaviors
    async function activate_discord_goals() {
        fs.readdir('./discord/goals/', (err, files) => {
            for (const file_path of files) {
                if (file_path.endsWith('.js')) {
                    import("../discord/goals/" + file_path);
                }
            }
        });
    }
    async function activate_discord_behaviors() {
        fs.readdir('./discord/behaviors/', (err, files) => {
            for (const file_path of files) {
                import("../discord/behaviors/" + file_path);
            }
        });
    }

    activate_discord_goals();
    activate_discord_behaviors();
});

export const DiscordClient = client;