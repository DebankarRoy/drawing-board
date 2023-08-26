const sliderContainer = document.getElementById("sliderContainer");
const slider = document.getElementById("slider");
const sliderValue = document.getElementById("sliderValue");

// Initially hide the slider
slider.style.width = "0";
slider.style.opacity = "0";

// Toggle slider visibility on value click
sliderValue.addEventListener("click", (event) => {
	event.stopPropagation(); // Prevent the click event from propagating to the container
	slider.style.width = "100%";
	slider.style.opacity = "1";
});

// Hide the slider on a click outside of the container
document.addEventListener("click", () => {
	slider.style.width = "0";
	slider.style.opacity = "0";
});

// Prevent the click outside event from hiding the slider when clicking inside the container
sliderContainer.addEventListener("click", (event) => {
	event.stopPropagation();
});

// Update the text when the slider value changes
slider.addEventListener("input", () => {
	sliderValue.textContent = slider.value;
});
