import { App } from "./app";
import { getScreenDimensions } from "include";
import { createCliRenderer, Box, Text, Input } from '@opentui/core';

const renderer = await createCliRenderer();

renderer.root.add(
    Box(
        { width: 40, height: 10, borderStyle: "rounded", padding: 1 },
        Text({ content: "Welcome!" }),
        Input({ placeholder: "Enter your name..." }),)
)

export default async function main() {
    return <App prompt="" />;
}

void main();
