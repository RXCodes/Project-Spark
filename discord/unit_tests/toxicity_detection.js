import { Worker } from "worker_threads";
const GOAL_NAME = "Reduce Toxicity";
import { ToxicityThresholds } from "../goals/reduce_toxicity.js";
import Path from "path";
import { reduce_toxicity_worker } from "../workers/worker_access.js";
const worker = reduce_toxicity_worker;

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

// spam lots of messages to stress test - this shouldn't crash
for (let i = 0; i < 100; i++) {
    worker.postMessage({
        thresholds: ToxicityThresholds,
        type: "test_stress",
        message_id: "example",
        contents: "this is a test"
    });
}

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