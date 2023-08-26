const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

// Declaring default states
let drawing = false;
let lastX = 0;
let lastY = 0;
let strokeStyle = "#000";
let lineWidth = 2;
let isEraserMode = false;
let drawMode = "free";

// Flag to check the drawing mode
let isCircleDrawing = false;
let isRectangleDrawing = false;

// Variables to store the circle's center and radius
let centerX = 0;
let centerY = 0;
let radius = 0;

// Arrays to store drawing history and redo history
const drawingHistory = [];
const redoHistory = [];
const clearHistory = []; // Separate history for clear actions
let historyIndex = -1;

// Set up event listeners
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
	// Clone the canvas data before clearing
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	clearHistory.push(imageData);

	// Clear only the circle, not the entire canvas
	if (isCircleDrawing) {
		ctx.clearRect(
			centerX - radius - lineWidth,
			centerY - radius - lineWidth,
			radius * 2 + lineWidth * 2,
			radius * 2 + lineWidth * 2
		);
	} else {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

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

function toggleEraser() {
	isEraserMode = !isEraserMode; // Toggle the eraser mode
	if (isEraserMode) {
		strokeStyle = "white"; // Set the strokeStyle to white when in eraser mode
		drawMode = "free";
	} else {
		strokeStyle = document.getElementById("colorsButton").value; // Set it back to the selected color
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

const clearButton = document.getElementById("clearButton");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const eraserButton = document.getElementById("eraserButton");
const colorsButton = document.getElementById("colorsButton");
const circleButton = document.getElementById("circleButton");
const sizeSlider = document.getElementById("slider");
const rectangleButton = document.getElementById("rectangleButton");

clearButton.addEventListener("click", clearCanvas);
undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);
eraserButton.addEventListener("click", toggleEraser);
colorsButton.addEventListener("input", (e) => colorChange(e));
circleButton.addEventListener("click", () => {
	drawMode = "circle";
});
rectangleButton.addEventListener("click", () => {
	drawMode = "rectangle";
});
sizeSlider.addEventListener("input", (e) => sizeChange(e));
