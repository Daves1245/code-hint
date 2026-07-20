import type { ChatMode } from "store/src/types";

// add more spots here as they're needed
export const CHAT_MODE_COLORS: Record<ChatMode, string> = {
  direct: "cyan",
  thinking: "magenta",
  planning: "yellow",
  executing: "green",
};

interface AirlineProps {
  error: string | undefined;
  chatMode: ChatMode;
}

export const Airline = ({ error, chatMode }: AirlineProps) => {
  return (
    <box width="100%" flexShrink={0} flexDirection="row" paddingX={1} gap={1}>
      {error && <text fg="red">{`Error: ${error}`}</text>}
      <text fg={CHAT_MODE_COLORS[chatMode]}>{chatMode}</text>
    </box>
  );
};
