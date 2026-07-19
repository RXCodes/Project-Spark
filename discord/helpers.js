import {PermissionsBitField} from "discord.js";

export const Helper = {
    delete_messages,
    is_member_admin
}

function delete_messages(messages) {
    for (const message of messages) {
        try {
            message.delete();
        } catch (error) {}
    }
}

function is_member_admin(member) {
    return member.permissions.has(PermissionsBitField.Flags.ADMINISTRATOR);
}