import terminalSize from "terminal-size";

export const getScreenDimensions = () => {
  return terminalSize();
};
