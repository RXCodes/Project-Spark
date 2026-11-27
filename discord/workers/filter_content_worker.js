// the actual script responsible for handling filtering content
import { parentPort } from 'worker_threads';
import { HomoglyphMapHelper } from "../homoglyph_map.js";
import { find_blocked_term, prepare_allowlist } from "../filter_match.js";

let Filters = [];
let AllowList = [];

function setup_filters(filters, allowlist) {
    Filters = [];
    for (let filter of filters) {
        Filters.push(filter);
    }
    const normalized_allowlist = [];
    for (const entry of allowlist || []) {
        normalized_allowlist.push(HomoglyphMapHelper.normalize_text(String(entry)));
    }
    AllowList = prepare_allowlist(normalized_allowlist);
}

function ingest_message(content, type, id) {
    // normalize the text for analysis
    let normalized_message = HomoglyphMapHelper.normalize_text(content);
    const detected = find_blocked_term(normalized_message, Filters, AllowList);
    if (detected) {
        parentPort.postMessage({
            result: 'detected',
            filter: detected.filter,
            message_id: id,
            type: type,
            word: detected.word
        });
        return;
    }
    parentPort.postMessage({ result: 'clear', type: type, message_id: id });
}

parentPort.on('message', (message) => {
    if (message.type === "setup_filters") {
        setup_filters(message.filters, message.allowlist);
        return;
    }
    if (message.type === "ingest_message") {
        ingest_message(message.message.content, message.type, message.message.id);
        return;
    }
    if (message.type === "ingest_message_chain") {
        ingest_message(message.contents, message.type, message.message_id);
    }
});