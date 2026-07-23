import { useEffect, useMemo } from "react";
import type { HistoryEntry } from "store/src/types";
import { createMarkdownStyle, createThinkingStyle } from "./markdownStyle";

interface HistoryPaneProps {
  history: HistoryEntry[];
}

export const HistoryPane = ({ history }: HistoryPaneProps) => {
  // Built once the renderer is live (SyntaxStyle needs the native render lib),
  // and torn down on unmount since each holds a native handle.
  const textStyle = useMemo(() => createMarkdownStyle(), []);
  const thinkingStyle = useMemo(() => createThinkingStyle(), []);
  useEffect(
    () => () => {
      textStyle.destroy();
      thinkingStyle.destroy();
    },
    [textStyle, thinkingStyle],
  );

  return (
    // Fills the flex slot the parent hands it (flexGrow) rather than sizing
    // itself from measured content. opentui's scrollbox clamps nested content
    // (the markdown blocks) to the viewport height while measuring, so a
    // content-derived height starves the viewport and the entries collapse
    // onto a single clipped line. A definite height from the layout keeps the
    // viewport tall enough for the markdown to wrap and report its real height,
    // and stickyScroll pins the view to the newest output as it streams in.
    <scrollbox
      flexGrow={1}
      flexShrink={1}
      minHeight={0}
      width="100%"
      scrollY
      stickyScroll
      stickyStart="bottom"
      contentOptions={{ flexDirection: "column", padding: 1 }}
    >
      {history.map((entry, i) => (
        <markdown
          key={i}
          content={entry.content}
          syntaxStyle={entry.kind === "thinking" ? thinkingStyle : textStyle}
          width="100%"
        />
      ))}
    </scrollbox>
  );
};
