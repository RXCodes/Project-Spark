import * as toxicity from '@tensorflow-models/toxicity';
import { parentPort } from 'worker_threads';
import { HomoglyphMapHelper } from "../homoglyph_map.js";

// words to replace to prevent false detections
const KeywordReplacements = {
    "beast": "guy",
    "clanker": "bot"
}

// the toxicity model - only needs to be loaded once
const toxicity_model = toxicity.load(0, []);

// substitute keywords according to KeywordReplacements
function substitute_keywords(text, keyword_replacements) {
    let output = text;
    for (const [key, value] of Object.entries(keyword_replacements || {})) {
        output = output.replace(key, value);
    }
    return output;
}

// process one message at a time to prevent multithreading issues
let process_queue = [];
let is_busy = false;
function process_next_message() {
    if (is_busy) {
        return;
    }
    if (process_queue.length == 0) {
        return;
    }
    let message = process_queue.shift();
    let normalized_message = message.normalized_message;
    const prediction_matches = {};
    const threshold_dictionary = message.thresholds;
    is_busy = true;
    toxicity_model.then(model => {
        model.classify([normalized_message]).then(predictions => {
            predictions.forEach(prediction => {
                let probability = prediction.results[0].probabilities[1];
                let target_probability = threshold_dictionary[prediction.label];
                prediction_matches[prediction.label] = probability >= target_probability;
            });
            parentPort.postMessage({
                message_id: message.message_id,
                type: message.type,
                matches: prediction_matches
            });
            is_busy = false;
            process_next_message();
        });
    });
}

parentPort.on('message', async (message) => {
    // normalize the message before processing
    let normalized_message = HomoglyphMapHelper.normalize_text(message.contents);
    normalized_message = substitute_keywords(normalized_message, KeywordReplacements);

    // if the message is too short, it will crash - assume it is safe
    if (normalized_message.length < 5) {
        parentPort.postMessage({
            message_id: message.message_id,
            type: message.type,
            matches: {}
        });
        return;
    }

    // add to the process queue
    message.normalized_message = normalized_message;
    process_queue.push(message);
    process_next_message();
});