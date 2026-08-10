// ensure single instance of each worker to reduce memory usage
import { Worker } from "worker_threads";
import Path from "path";

export const reduce_toxicity_worker = new Worker(Path.join(import.meta.dirname, "reduce_toxicity_worker.js"));
export const filter_content_worker = new Worker(Path.join(import.meta.dirname, "filter_content_worker.js"));