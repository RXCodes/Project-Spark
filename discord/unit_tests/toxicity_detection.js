import { Worker } from "worker_threads";
import { v4 as uuid4 } from "uuid";
const GOAL_NAME = "Reduce Toxicity";
const worker = new Worker('./Discord/workers/reduce_toxicity_worker.js', {});
import { ToxicityThresholds } from "../goals/reduce_toxicity.js";

// this shouldn't be considered as a harmful message
worker.postMessage({
    thresholds: ToxicityThresholds,
    type: "test_negative",
    message_id: "You're a beast dude",
    contents: "You're a beast dude"
});

// this should be considered as a harmful message
worker.postMessage({
    thresholds: ToxicityThresholds,
    type: "test_positive",
    message_id: "You suck",
    contents: "You suck"
});

worker.on("message", (message) => {
    // all labels from most offensive to least offensive
    const ranked_offensive_labels = [
        "severe_toxicity",
        "threat",
        "obscene",
        "sexual_explicit",
        "identity_attack",
        "insult",
        "toxicity"
    ];

    let detected = false;
    // check for matches - take action based on highest offense
    for (const offensive_label of ranked_offensive_labels) {
        if (message.matches[offensive_label]) {
            detected = true;
            break;
        }
    }

    if (detected && message.type === "test_negative") {
        throw "False positive detected for message: " + message.message_id;
    }

    if (!detected && message.type === "test_positive") {
        throw "False negative detected for message: " + message.message_id;
    }
});