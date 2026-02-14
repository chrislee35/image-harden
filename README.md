# Image Protection Tool

A browser-based tool designed to protect artists' images from unauthorized AI training by applying imperceptible modifications and embedding protective metadata.

## Motivation

As AI companies increasingly scrape the web for training data, artists and content creators face the challenge of protecting their intellectual property. Many AI models are trained on copyrighted works without permission or compensation to the original creators.

This tool empowers artists to take control of their work by applying subtle transformations that can interfere with AI training processes while maintaining visual quality for human viewers. By embedding explicit copyright metadata and applying protective filters, artists can assert their rights and make their images less suitable for unauthorized machine learning applications.

## Features

- **Browser-based processing** - All image processing happens locally in your browser, ensuring privacy
- **Multiple intensity levels** - Choose between Light, Medium, and Heavy protection based on your needs
- **Automatic download** - Processed images are automatically downloaded after transformation
- **Copyright metadata** - Embeds EXIF data explicitly prohibiting AI training
- **Author attribution** - Remembers your name and includes it in image metadata
- **Side-by-side preview** - Compare original and protected versions before download

## Image Filtering Techniques

The tool applies a combination of techniques designed to protect images from AI training:

### 1. Gaussian Noise
Adds random pixel-level variations that are imperceptible to humans but can disrupt neural network training by introducing inconsistencies in the data.

### 2. Color Jitter
Randomly adjusts brightness, contrast, and saturation within subtle ranges. This creates variations that make it harder for AI models to learn consistent color patterns.

### 3. Micro Resampling
Applies slight scaling transformations that introduce resampling artifacts. These artifacts can interfere with feature extraction in computer vision models.

### 4. Frequency Watermark
Embeds a high-frequency pattern across the image using sinusoidal functions. This creates a subtle signature that can disrupt frequency-domain analysis used in many AI training pipelines.

### 5. Edge Blur
Selectively blurs the edges of the image, which can interfere with edge detection algorithms commonly used in computer vision and AI training.

### 6. EXIF Metadata
Embeds comprehensive metadata including:
- Copyright notice with explicit "No AI Training" declaration
- Author attribution
- Software identification
- Timestamp information
- User comment field with detailed usage restrictions

## Usage

1. Open `index.html` in a modern web browser
2. (Optional) Enter your name in the Author field - it will be remembered for future use
3. (Optional) Toggle copyright metadata inclusion
4. Select your desired protection intensity (Light, Medium, or Heavy)
5. Upload an image by clicking the upload area or dragging and dropping
6. The protected image will automatically download as a JPEG file
7. Upload additional images as needed - the tool stays ready for multiple uploads

## Technical Details

- **Output format**: JPEG with quality set to 95%
- **Metadata standard**: EXIF via piexifjs library
- **Processing**: Client-side using HTML5 Canvas API
- **Storage**: Author name persisted in browser cookies

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas API
- File API
- ES6 JavaScript

## Collaboration

I'm open to collaboration on this project! Whether you're interested in:
- Improving the protection algorithms
- Adding new filtering techniques
- Enhancing the user interface
- Contributing research on AI training vulnerabilities
- Testing and providing feedback

Feel free to reach out or submit contributions. Together we can build better tools to protect artists' rights in the age of AI.

## License

This tool is provided as-is for artists and content creators to protect their work. Use it freely to safeguard your creative output.

## Disclaimer

While these techniques can make images less suitable for AI training, no method is 100% foolproof. This tool is part of a broader effort to establish norms around consent and compensation for AI training data. Always consider multiple layers of protection including watermarks, legal notices, and platform-specific protections.
