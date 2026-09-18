import { RtspPipeline } from "./pipeline.js";

export function createPipeline(url) {
  return new RtspPipeline(url);
}
