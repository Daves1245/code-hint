import { createCliRenderer } from "@opentui/core";
import { App } from "./app";
import { createRoot } from "@opentui/react";

const renderer = await createCliRenderer();

export default async function main() {
  createRoot(renderer).render(<App />);
}

void main();
