const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

// Set the canvas background color to white
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Declaring default states
let drawing = false;
let lastX = 0;
let lastY = 0;
let strokeStyle = "#000";
let lineWidth = 2;
let isEraserMode = false;
let drawMode = "free";
let isCircleDrawing = false;
let isRectangleDrawing = false;

// Variables to store the circle's center and radius
let centerX = 0;
let centerY = 0;
let radius = 0;

// Arrays to store drawing history and redo history
const drawingHistory = [];
const redoHistory = [];
const clearHistory = [];
let historyIndex = -1;

// Set up event listeners for canvas
canvas.addEventListener("mousedown", (e) => {
	drawing = true;
	[lastX, lastY] = [
		e.clientX - canvas.offsetLeft,
		e.clientY - canvas.offsetTop,
	];

	if (drawMode === "circle") {
		isCircleDrawing = true;
		centerX = lastX;
		centerY = lastY;
	} else if (drawMode === "rectangle") {
		isRectangleDrawing = true;
		startX = lastX;
		startY = lastY;
	}
});
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", () => {
	if (drawing) {
		saveDrawingState();
		drawing = false;

		if (isCircleDrawing) {
			isCircleDrawing = false;
			// Draw the final circle and save it
			drawCircleFinal();
			saveDrawingState();
		}
	}
});

// Function to handle all the drawings
function draw(e) {
	if (!drawing) return;
	switch (drawMode) {
		case "free":
			drawFree(e);
			break;
		case "circle":
			if (strokeStyle === "white")
				strokeStyle = document.getElementById("colorsButton").value;
			if (isCircleDrawing) {
				updateCircle(e);
			}
			break;
		case "rectangle":
			if (strokeStyle === "white")
				strokeStyle = document.getElementById("colorsButton").value;
			if (isRectangleDrawing) {
				updateRectangle(e);
			}
			break;
		case "eraser":
			strokeStyle = "white";
			drawFree(e);
			break;
		case "line":
			drawLine(e);
			break;
		case "triangle":
			drawTriangle(e);
			break;
	}
}

function saveDrawingState() {
	// Clone the canvas data and store it in the history
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	// If there are future steps in the history, remove them
	if (historyIndex < drawingHistory.length - 1) {
		drawingHistory.splice(historyIndex + 1);
	}

	drawingHistory.push(imageData);
	historyIndex++;
}

function clearCanvas() {
	// Fill the canvas with white to clear the background
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Clone the canvas data before clearing
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	clearHistory.push(imageData);

	// Additional code to clear specific shapes if needed
	// ...

	// Redraw the saved drawings
	restoreDrawingState();

	// Save the initial state of the canvas again
	saveDrawingState();
}

function restoreDrawingState() {
	// Restore the drawing state from history
	if (historyIndex >= 0) {
		const previousState = drawingHistory[historyIndex];
		ctx.putImageData(previousState, 0, 0);
	}
}

function undo() {
	if (historyIndex >= 0) {
		// Move the current state to redo history
		redoHistory.push(drawingHistory[historyIndex]);

		// Decrement the history index
		historyIndex--;

		// Restore the previous canvas state
		restoreDrawingState();
	}
}

function redo() {
	if (redoHistory.length > 0) {
		// Get the next state from redo history
		const nextState = redoHistory.pop();

		// Increment the history index
		historyIndex++;

		// Draw the next state on the canvas
		ctx.putImageData(nextState, 0, 0);

		// Add it back to drawing history
		drawingHistory[historyIndex] = nextState;
	}
}

function colorChange(e) {
	const selectedColor = e.target.value;
	strokeStyle = selectedColor;
}

function drawFree(e) {
	ctx.beginPath();
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = lineWidth;
	ctx.lineCap = "round";
	ctx.moveTo(lastX, lastY);
	[lastX, lastY] = [
		e.clientX - canvas.offsetLeft,
		e.clientY - canvas.offsetTop,
	];
	ctx.lineTo(lastX, lastY);
	ctx.stroke();
}
function drawLine(e) {
	if (!drawing) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	restoreDrawingState(); // Restore the saved drawings

	ctx.beginPath();
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = lineWidth;
	ctx.lineCap = "round";
	ctx.moveTo(lastX, lastY);

	// Check if the Shift key is pressed
	const isShiftPressed = e.shiftKey;

	if (isShiftPressed) {
		// Calculate the change in X and Y from the starting point
		const dx = Math.abs(e.clientX - canvas.offsetLeft - lastX);
		const dy = Math.abs(e.clientY - canvas.offsetTop - lastY);

		// Constrain the line to be diagonal (45 degrees) or horizontal/vertical
		if (dx > dy) {
			// Horizontal line
			ctx.lineTo(e.clientX - canvas.offsetLeft, lastY);
		} else {
			// Vertical line
			ctx.lineTo(lastX, e.clientY - canvas.offsetTop);
		}
	} else {
		// Normal line without Shift key
		ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
	}

	ctx.stroke();
}
function updateCircle(e) {
	// Calculate the new circle parameters based on the mouse position
	const newRadius = Math.sqrt(
		Math.pow(e.clientX - canvas.offsetLeft - centerX, 2) +
			Math.pow(e.clientY - canvas.offsetTop - centerY, 2)
	);

	// Clear the entire canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Redraw the previous drawings (restore the saved drawing state)
	restoreDrawingState();

	// Draw the updated circle
	drawCircle(centerX, centerY, newRadius);
}

function drawCircle(x, y, r) {
	ctx.beginPath();
	ctx.strokeStyle = strokeStyle;
	ctx.fillStyle = "transparent";
	ctx.lineWidth = lineWidth;
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();
}
function drawTriangle(e) {
	if (!drawing) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	restoreDrawingState(); // Restore the saved drawings

	ctx.beginPath();
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = lineWidth;
	ctx.lineCap = "round";

	const x1 = lastX;
	const y1 = lastY;
	const x2 = e.clientX - canvas.offsetLeft;
	const y2 = e.clientY - canvas.offsetTop;

	const centerX = (x1 + x2) / 2;
	const centerY = (y1 + y2) / 2;

	// Calculate the distance from the center to a vertex to make it equilateral
	const sideLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	const height = (Math.sqrt(3) / 2) * sideLength; // Height of an equilateral triangle

	// Calculate the coordinates of the vertices
	const x3 = centerX - sideLength / 2;
	const y3 = centerY + height / 2;

	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineTo(x3, y3);

	ctx.closePath(); // Close the path to complete the triangle
	ctx.stroke();
}

function drawRectangle(x1, y1, x2, y2) {
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = lineWidth;
	ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
}
function sizeChange(e) {
	const selectedSize = e.target.value;
	lineWidth = selectedSize;
}
function updateRectangle(e) {
	const x2 = e.clientX - canvas.offsetLeft;
	const y2 = e.clientY - canvas.offsetTop;

	// Clear the entire canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Redraw the previous drawings (restore the saved drawing state)
	restoreDrawingState();

	// Draw the updated rectangle
	drawRectangle(startX, startY, x2, y2);
}
function saveDrawing() {
	// Create a temporary anchor element
	const downloadLink = document.createElement("a");

	// Set the download attribute and create a data URL of the canvas content
	downloadLink.download = "drawing.png";
	downloadLink.href = canvas.toDataURL("image/png");

	// Simulate a click on the anchor element to trigger the download
	downloadLink.click();
}

// getting buttons
const clearButton = document.getElementById("clearButton");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const pencilButton = document.getElementById("pencilButton");
const eraserButton = document.getElementById("eraserButton");
const colorsButton = document.getElementById("colorsButton");
const lineButton = document.getElementById("lineButton");
const circleButton = document.getElementById("circleButton");
const triangleButton = document.getElementById("triangleButton");
const rectangleButton = document.getElementById("rectangleButton");
const sizeSlider = document.getElementById("slider");
const saveButton = document.getElementById("saveButton");

// setting event handlers for the buttons
clearButton.addEventListener("click", clearCanvas);
undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);
pencilButton.addEventListener("click", () => {
	drawMode = "free";
});
eraserButton.addEventListener("click", () => {
	drawMode = "eraser";
});
colorsButton.addEventListener("input", (e) => colorChange(e));
lineButton.addEventListener("click", () => {
	drawMode = "line";
	isCircleDrawing = false;
});
circleButton.addEventListener("click", () => {
	drawMode = "circle";
});
triangleButton.addEventListener("click", () => {
	drawMode = "triangle";
	isCircleDrawing = false;
});
rectangleButton.addEventListener("click", () => {
	drawMode = "rectangle";
});
sizeSlider.addEventListener("input", (e) => sizeChange(e));
saveButton.addEventListener("click", saveDrawing);
