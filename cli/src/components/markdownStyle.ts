import { SyntaxStyle } from "@opentui/core";

// Style map for the <markdown> renderable. Keys are the tree-sitter capture
// scopes emitted by opentui's bundled markdown/markdown_inline grammars (see
// @opentui/core/assets/markdown*/highlights.scm) - anything not listed falls
// back to `default`.
//
// Must be built after the renderer boots, since SyntaxStyle.fromStyles reaches
// for the native render lib - call this from inside a mounted component.
export function createMarkdownStyle(): SyntaxStyle {
  return SyntaxStyle.fromStyles({
    default: { fg: "#e6edf3" },

    "markup.heading": { fg: "#58a6ff", bold: true },
    "markup.heading.1": { fg: "#58a6ff", bold: true },
    "markup.heading.2": { fg: "#58a6ff", bold: true },
    "markup.heading.3": { fg: "#79c0ff", bold: true },
    "markup.heading.4": { fg: "#79c0ff", bold: true },
    "markup.heading.5": { fg: "#79c0ff" },
    "markup.heading.6": { fg: "#79c0ff" },

    "markup.list": { fg: "#ff7b72" },
    "markup.list.checked": { fg: "#3fb950" },
    "markup.list.unchecked": { fg: "#8b949e" },

    "markup.quote": { fg: "#8b949e", italic: true },

    "markup.raw": { fg: "#a5d6ff" },
    "markup.raw.block": { fg: "#a5d6ff" },

    "markup.strong": { fg: "#e6edf3", bold: true },
    "markup.italic": { fg: "#e6edf3", italic: true },
    "markup.strikethrough": { fg: "#8b949e", dim: true },

    "markup.link": { fg: "#58a6ff", underline: true },
    "markup.link.label": { fg: "#58a6ff" },
    "markup.link.url": { fg: "#8b949e", underline: true },

    "keyword.directive": { fg: "#ff7b72" },
    "string.escape": { fg: "#d2a8ff" },
    "punctuation.delimiter": { fg: "#8b949e" },
    "punctuation.special": { fg: "#8b949e" },
    label: { fg: "#79c0ff" },
    conceal: { fg: "#8b949e", dim: true },
  });
}

// Style for "thinking" history entries - the model's reasoning. Only `default`
// is defined, so every capture scope falls back to it and the whole entry
// renders muted and italic, setting it apart from regular assistant text.
export function createThinkingStyle(): SyntaxStyle {
  return SyntaxStyle.fromStyles({
    default: { fg: "#8b949e", italic: true },
  });
}
