exports.createExcalidrawFromSteps = (steps) => {
  const elements = [];
  let y = 100;

  steps.forEach((step, i) => {
    elements.push({
      type: "text",
      version: 1,
      versionNonce: Math.floor(Math.random() * 100000),
      isDeleted: false,
      id: `text-${i}`,
      fillStyle: "hachure",
      strokeWidth: 1,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      width: 300,
      height: 100,
      angle: 0,
      x: 200,
      y: y + i * 150,
      seed: Math.floor(Math.random() * 100000),
      text: step,
      fontSize: 20,
      fontFamily: 1,
      textAlign: "left",
      verticalAlign: "top",
      baseline: 20,
    });
  });

  return {
    type: "excalidraw",
    version: 2,
    source: "slate-ai",
    elements,
    appState: {
      viewBackgroundColor: "#ffffff",
      currentItemFontFamily: 1,
      currentItemFontSize: 20,
    },
  };
};
