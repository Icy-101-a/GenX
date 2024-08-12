const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");

const API_KEY = "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";
const API_URL = "https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image"

let isImageGenerating = false;

const query = async (data) => {
    try {
        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.blob();
        return result;
    } catch (error) {
        console.error("Error in query function:", error);
        throw error;
    }
};

const updateImageCard = (imgBlobArray) => {
    imgBlobArray.forEach((blob, index) => {
        const imgCard = imageGallery.querySelectorAll(".img-card")[index];
        const imgElement = imgCard.querySelector("img");
        const downloadBtn = imgCard.querySelector(".download-btn");

        // Set the image source to the Blob URL
        const imgUrl = URL.createObjectURL(blob);
        imgElement.src = imgUrl;

        // When the image is loading remove the loading class and set download attribute
        imgElement.onload = () => {
            imgCard.classList.remove("loading");
            downloadBtn.setAttribute("href", imgUrl);
            downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
        };
    });
};

const generateAiImages = async (userPrompt, userImgQuantity) => {
    try {
        // Construct the request payload based on typical Hugging Face usage
        const imgBlobArray = await Promise.all(
            Array.from({ length: parseInt(userImgQuantity) }, () => 
                query({ inputs: userPrompt }) // Adjust based on API requirements
            )
        );
        updateImageCard(imgBlobArray);
    } catch (error) {
        alert("Failed to generate images. Please try again.");
        console.error("Error in generateAiImages function:", error);
    } finally {
        isImageGenerating = false;
    }
};

const handleFormSubmission = (e) => {
    e.preventDefault();
    if (isImageGenerating) return;
    isImageGenerating = true;

    // Get user input and image quantity values from the form
    const userPrompt = e.srcElement[0].value;
    const userImgQuantity = e.srcElement[1].value;

    // Creating HTML markup for image cards with loading state
    const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
        `<div class="img-card loading">
                <img src="assets/loader.svg" alt="image">
                <a href="#" class="download-btn">
                    <img src="assets/download.svg" alt="download icon">
                </a>
        </div>`
    ).join("");

    imageGallery.innerHTML = imgCardMarkup;
    generateAiImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleFormSubmission);
