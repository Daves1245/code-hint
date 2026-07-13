import terminalSize from "terminal-size";

export const getScreenDimensions = () => {
  const { columns, rows } = terminalSize();
  return { width: columns, height: rows };
};
