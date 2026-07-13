import { App } from "./app";
import { getScreenDimensions } from "include";
import { createCliRenderer, Box, Text, Input } from "@opentui/core";

const renderer = await createCliRenderer();

export default async function main() {
  renderer.root.add(App);
}

void main();
