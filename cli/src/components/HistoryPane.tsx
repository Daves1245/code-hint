import { useRef } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";

interface HistoryPaneProps {
  history: string[];
  height: number;
  onContentSizeChange: (height: number) => void;
}

export const HistoryPane = ({
  history,
  height,
  onContentSizeChange,
}: HistoryPaneProps) => {
  const scrollboxRef = useRef<ScrollBoxRenderable>(null);

  return (
    <scrollbox
      ref={scrollboxRef}
      height={height}
      flexShrink={1}
      width="100%"
      scrollY
      stickyScroll
      stickyStart="bottom"
      contentOptions={{
        flexDirection: "column",
        padding: 1,
        // fires on resize, on entries being appended, and on any future
        // in-place text updates (e.g. streamed output) since all of those
        // change the content box's wrapped-line count
        onSizeChange: () => {
          if (scrollboxRef.current) {
            onContentSizeChange(scrollboxRef.current.content.height);
          }
        },
      }}
    >
      {history.map((entry, i) => (
        <text key={i}>{entry}</text>
      ))}
    </scrollbox>
  );
};
