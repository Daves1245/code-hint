import { App } from "./app";
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";

const renderer = await createCliRenderer();

export default async function main() {
  createRoot(renderer).render(<App />);
}

void main();
