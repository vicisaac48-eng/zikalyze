// Lightweight in-browser inference helper for a small FC classifier.
// Intended to run on compact exported weights (JSON) or inline weights for tiny models.

export type FCWeights = {
  w1: number[][]; // [out, in]
  b1: number[];   // [out]
  w2: number[][]; // [out, in]
  b2: number[];   // [out]
  w3: number[][]; // [out, in]
  b3: number[];   // [out]
  // feature normalization stats
  mean?: number[];
  std?: number[];
};

function relu(x: number): number { return Math.max(0, x); }

function matVecMul(mat: number[][], vec: number[]): number[] {
  const out = new Array(mat.length).fill(0);
  for (let i = 0; i < mat.length; i++) {
    let s = 0;
    const row = mat[i];
    const len = Math.min(row.length, vec.length);
    for (let j = 0; j < len; j++) s += row[j] * vec[j];
    out[i] = s;
  }
  return out;
}

function addBias(vec: number[], bias: number[]): number[] {
  const out = new Array(vec.length);
  for (let i = 0; i < vec.length; i++) out[i] = vec[i] + (bias[i] || 0);
  return out;
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - max));
  const sum = exps.reduce((a,b) => a+b, 0) + 1e-12;
  return exps.map(e => e / sum);
}

export function normalize(features: number[], mean?: number[], std?: number[]): number[] {
  if (!mean || !std) return features.slice();
  const out = new Array(features.length);
  for (let i = 0; i < features.length; i++) {
    const s = std[i] || 1;
    out[i] = (features[i] - (mean[i] || 0)) / s;
  }
  return out;
}

// Forward a very small 3-layer FC model (128->64->3) or any compatible shapes.
export function predict(features: number[], model: FCWeights): { probs: number[]; logits: number[] } {
  const x = normalize(features, model.mean, model.std);
  const h1 = addBias(matVecMul(model.w1, x), model.b1).map(relu);
  const h2 = addBias(matVecMul(model.w2, h1), model.b2).map(relu);
  const logits = addBias(matVecMul(model.w3, h2), model.b3);
  const probs = softmax(logits);
  return { probs, logits };
}

// Simple loader to fetch weights JSON produced by the training step.
export async function loadWeights(url: string): Promise<FCWeights> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load weights from ${url}`);
  const json = await res.json();
  return json as FCWeights;
}

// Convenience small-model forward when you want to embed weights directly in TS.
// Usage:
// import { predict } from '.../inference';
// const { probs } = predict(features, weights);

export default { predict, loadWeights };
