import { useRef } from "react";
import type { BoxRenderable, TextareaRenderable } from "@opentui/core";

interface PromptInputProps {
  focused: boolean;
  onSubmit: (value: string) => void;
  onSizeChange: (height: number) => void;
}

// plain Enter submits instead of inserting a newline, overriding the
// textarea's default binding
const submitKeyBindings = [
  { name: "return", action: "submit" as const },
  { name: "kpenter", action: "submit" as const },
  { name: "linefeed", action: "submit" as const },
];

export const PromptInput = ({
  focused,
  onSubmit,
  onSizeChange,
}: PromptInputProps) => {
  const boxRef = useRef<BoxRenderable>(null);
  const textareaRef = useRef<TextareaRenderable>(null);

  return (
    <box
      ref={boxRef}
      border
      width="100%"
      padding={1}
      flexShrink={0}
      height="auto"
      onSizeChange={() => {
        if (boxRef.current) onSizeChange(boxRef.current.height);
      }}
    >
      <textarea
        ref={textareaRef}
        width="100%"
        height="auto"
        focused={focused}
        wrapMode="word"
        keyBindings={submitKeyBindings}
        onSubmit={() => {
          const textarea = textareaRef.current;
          if (!textarea) return;
          const value = textarea.plainText;
          textarea.clear();
          onSubmit(value);
        }}
      />
    </box>
  );
};
