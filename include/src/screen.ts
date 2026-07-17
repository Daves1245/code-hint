import { useTerminalDimensions } from '@opentui/react';

export const getScreenDimensions = () => {
    const { width, height } = useTerminalDimensions();
  return { width, height };
};
