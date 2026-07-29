import type { Embedder } from "store/src/types";

// TODO: wire up to the real embedding model (zeroentropy local model for now)
export const embedder: Embedder = {
  model: "model",
  dimensions: 0,
  async embed(texts: string[]): Promise<number[][]> {

  },
};
