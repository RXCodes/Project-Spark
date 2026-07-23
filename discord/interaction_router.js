import { DiscordClient } from "../foundation/discord_bot.js";
import Discord from "discord.js";

const registered_message_events = [];
const registered_message_chain_events = [];
let cached_messages = [];
const CHAIN_MESSAGE_EXPIRATION_TIME = 30;
const CHAIN_MESSAGE_LENGTH = 5;

export const DiscordInteractionRouter = {
    register_message_event,
    register_message_chain_event,
    request_action_on_message
}

// register a message event with priority - highest priority executes first
function register_message_event(priority, func) {
    registered_message_events.push({
        call: func,
        priority: priority
    });
    registered_message_events.sort(function(a, b) {
        return b.priority - a.priority;
    });
}

// register message chain events
function register_message_chain_event(priority, func) {
    registered_message_chain_events.push({
        call: func,
        priority: priority
    });
    registered_message_chain_events.sort(function(a, b) {
        return b.priority - a.priority;
    });
}

// ensure each message only has one action done on it
const actioned_messages = {};
function request_action_on_message(message) {
    if (actioned_messages[message.id]) {
        return false;
    }
    actioned_messages[message.id] = true;
    setTimeout(function () {
        delete actioned_messages[message.id];
    }, 1000 * 15);
    return true;
}

// handle chain messages if any
function update_cached_messages() {
    cached_messages = cached_messages.filter(time => Date.now() - time <= CHAIN_MESSAGE_EXPIRATION_TIME * 1000);
    cached_messages.sort(function(a, b) {
        return a.createdAt - b.createdAt;
    });
    const chain_messages = {};
    cached_messages.forEach(cached_message => {
        let messages = chain_messages[cached_message.author.id] || [];
        messages.push(cached_message);
        chain_messages[cached_message.author.id] = messages;
    });
    for (const [_, messages] of Object.entries(chain_messages)) {
        for (const event of registered_message_chain_events) {
            for (const message of messages) {
                if (actioned_messages[message.id]) {
                    break;
                }
            }
            event.call(messages, messages[0].member);
        }
    }
}

// handle message create events
DiscordClient.on(Discord.Events.MessageCreate, (message) => {
    for (const event of registered_message_events) {
        if (actioned_messages[message.id]) {
            delete actioned_messages[message.id];
            break;
        }
        event.call(message, Discord.Events.MessageCreate);
    }
    if (!actioned_messages[message.id]) {
        if (message.deletable) {
            cached_messages.push(message);
            update_cached_messages();
        }
    }
});

// treat edits as message create events in some goals
DiscordClient.on(Discord.Events.MessageUpdate, (message) => {
    for (const event of registered_message_events) {
        if (actioned_messages[message.id]) {
            delete actioned_messages[message.id];
            break;
        }
        event.call(message, Discord.Events.MessageUpdate);
        if (message.deletable) {
            update_cached_messages();
        }
    }
});