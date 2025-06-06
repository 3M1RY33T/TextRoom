const colors = [
    "#ef9a9a",
    "#e57373",
    "#ef5350",
    "#f44336",
    "#e53935",
    "#d32f2f",
    "#c62828",
    "#b71c1c",
    "#ff8a80",
    "#ff5252",
    "#ff1744",
    "#d50000",
    "#f48fb1",
    "#f06292",
    "#ec407a",
    "#e91e63",
    "#d81b60",
    "#c2185b",
    "#ad1457",
    "#880e4f",
    "#ff80ab",
    "#ff4081",
    "#f50057",
    "#c51162",
    "#ce93d8",
    "#ba68c8",
    "#ab47bc",
    "#9c27b0",
    "#8e24aa",
    "#7b1fa2",
    "#6a1b9a",
    "#4a148c",
    "#ea80fc",
    "#e040fb",
    "#d500f9",
    "#aa00ff",
    "#9575cd",
    "#7e57c2",
    "#673ab7",
    "#5e35b1",
    "#512da8",
    "#4527a0",
    "#311b92",
    "#7c4dff",
    "#651fff",
    "#6200ea",
    "#7986cb",
    "#5c6bc0",
    "#3f51b5",
    "#3949ab",
    "#303f9f",
    "#283593",
    "#1a237e",
    "#536dfe",
    "#3d5afe",
    "#304ffe",
    "#42a5f5",
    "#2196f3",
    "#1e88e5",
    "#1976d2",
    "#1565c0",
    "#0d47a1",
    "#448aff",
    "#2979ff",
    "#2962ff",
    "#4fc3f7",
    "#29b6f6",
    "#03a9f4",
    "#039be5",
    "#0288d1",
    "#0277bd",
    "#01579b",
    "#00b0ff",
    "#0091ea",
    "#26c6da",
    "#00bcd4",
    "#00acc1",
    "#0097a7",
    "#00838f",
    "#006064",
    "#4db6ac",
    "#26a69a",
    "#009688",
    "#00897b",
    "#00796b",
    "#00695c",
    "#004d40",
    "#4caf50",
    "#43a047",
    "#388e3c",
    "#2e7d32",
    "#1b5e20",
    "#7cb342",
    "#689f38",
    "#558b2f",
    "#33691e",
    "#ff8f00",
    "#ff6f00",
  ];
  const getRandomIndex = (arraySize) => Math.floor(Math.random() * arraySize);
  let usedColors = new Set();
  
  const getRandomColor = () => {
    const allColorsUsed = usedColors.size >= colors.length;
    if (allColorsUsed) return "#000";
  
    let colorPicked = null;
  
    while (!colorPicked) {
      const index = getRandomIndex(colors.length);
      const color = colors[index];
  
      if (!usedColors.has(color)) {
        usedColors.add(color);
        colorPicked = color;
      }
    }
  
    return colorPicked ?? "#000";
  };
  const releaseColor = (color) => usedColors.delete(color);
  
  export { getRandomColor, releaseColor };
  