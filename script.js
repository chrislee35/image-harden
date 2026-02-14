const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const processingStatus = document.getElementById('processingStatus');
const previewArea = document.getElementById('previewArea');
const originalCanvas = document.getElementById('originalCanvas');
const processedCanvas = document.getElementById('processedCanvas');
const authorInput = document.getElementById('authorInput');
const copyrightCheckbox = document.getElementById('copyrightCheckbox');
const intensitySelect = document.getElementById('intensitySelect');

// Intensity multipliers
const INTENSITY_MULTIPLIERS = {
    light: 0.5,
    medium: 1.0,
    heavy: 3.0
};

// Cookie helpers
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Load saved author from cookie
const savedAuthor = getCookie('imageAuthor');
if (savedAuthor) {
    authorInput.value = savedAuthor;
}

// Save author to cookie on change
authorInput.addEventListener('input', () => {
    setCookie('imageAuthor', authorInput.value);
});

// Upload area interactions
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        processImage(file);
    }
});

async function processImage(file) {
    // Show processing status
    previewArea.classList.add('hidden');
    processingStatus.classList.remove('hidden');

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
        img.onload = async () => {
            // Display original
            const origCtx = originalCanvas.getContext('2d');
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            origCtx.drawImage(img, 0, 0);

            // Process image
            const processedImageData = await applyProtections(img);
            
            // Display processed
            const procCtx = processedCanvas.getContext('2d');
            processedCanvas.width = img.width;
            processedCanvas.height = img.height;
            procCtx.putImageData(processedImageData, 0, 0);

            // Convert to JPEG with EXIF metadata
            const dataUrl = processedCanvas.toDataURL('image/jpeg', 0.95);
            const protectedDataUrl = addExifMetadata(dataUrl);
            downloadImage(protectedDataUrl, file.name);
            
            // Show preview and reset file input
            processingStatus.classList.add('hidden');
            previewArea.classList.remove('hidden');
            fileInput.value = '';
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

async function applyProtections(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Get intensity multiplier
    const intensity = INTENSITY_MULTIPLIERS[intensitySelect.value];
    
    // Apply transformations with intensity
    imageData = addGaussianNoise(imageData, 8 * intensity);
    imageData = addColorJitter(imageData, 0.05 * intensity);
    imageData = applyMicroResampling(imageData, intensity);
    imageData = addFrequencyWatermark(imageData, intensity);
    imageData = applyEdgeBlur(imageData, intensity);
    
    return imageData;
}

function addGaussianNoise(imageData, intensity) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = gaussianRandom() * intensity;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    return imageData;
}

function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function addColorJitter(imageData, amount) {
    const data = imageData.data;
    const brightness = 1 + (Math.random() - 0.5) * amount;
    const contrast = 1 + (Math.random() - 0.5) * amount;
    const saturation = 1 + (Math.random() - 0.5) * amount;
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Apply brightness
        r *= brightness;
        g *= brightness;
        b *= brightness;
        
        // Apply contrast
        r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
        g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
        b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
        
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
    }
    return imageData;
}

function applyMicroResampling(imageData, intensity) {
    const { width, height } = imageData;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Scale factor based on intensity (more aggressive scaling for higher intensity)
    const scaleFactor = 1 - (0.002 * intensity);
    tempCanvas.width = Math.floor(width * scaleFactor);
    tempCanvas.height = Math.floor(height * scaleFactor);
    tempCtx.putImageData(imageData, 0, 0);
    
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    finalCanvas.width = width;
    finalCanvas.height = height;
    finalCtx.drawImage(tempCanvas, 0, 0, width, height);
    
    return finalCtx.getImageData(0, 0, width, height);
}

function addFrequencyWatermark(imageData, intensity) {
    const data = imageData.data;
    const { width, height } = imageData;
    
    // Pattern strength based on intensity
    const patternStrength = 3 * intensity;
    
    // Add subtle high-frequency pattern
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const pattern = Math.sin(x * 0.5) * Math.cos(y * 0.5) * patternStrength;
            
            data[i] = Math.max(0, Math.min(255, data[i] + pattern));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + pattern));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + pattern));
        }
    }
    return imageData;
}

function applyEdgeBlur(imageData, intensity) {
    const { width, height, data } = imageData;
    const blurRadius = Math.ceil(2 * intensity);
    const edgeThreshold = Math.min(width, height) * 0.05 * intensity;
    
    const newData = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const distToEdge = Math.min(x, y, width - x - 1, height - y - 1);
            
            if (distToEdge < edgeThreshold) {
                const i = (y * width + x) * 4;
                let r = 0, g = 0, b = 0, count = 0;
                
                for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                    for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const ni = (ny * width + nx) * 4;
                            r += data[ni];
                            g += data[ni + 1];
                            b += data[ni + 2];
                            count++;
                        }
                    }
                }
                
                newData[i] = r / count;
                newData[i + 1] = g / count;
                newData[i + 2] = b / count;
            }
        }
    }
    
    imageData.data.set(newData);
    return imageData;
}

function addExifMetadata(dataUrl) {
    const zeroth = {};
    const exif = {};
    const gps = {};
    
    const includeCopyright = copyrightCheckbox.checked;
    const author = authorInput.value.trim();
    
    // Add author if provided
    if (author) {
        zeroth[piexif.ImageIFD.Artist] = author;
    }
    
    // Add copyright and usage restrictions if checked
    if (includeCopyright) {
        let copyrightText = "No AI Training Allowed";
        if (author) {
            copyrightText = `Copyright © ${new Date().getFullYear()} ${author} - ${copyrightText}`;
        }
        zeroth[piexif.ImageIFD.Copyright] = copyrightText;
        exif[piexif.ExifIFD.UserComment] = "This image is protected and may not be used for AI training, machine learning, or any automated data collection purposes without explicit written permission.";
    }
    
    // Add software tag
    zeroth[piexif.ImageIFD.Software] = "Image Protection Tool";
    
    // Add creation date
    const now = new Date();
    const dateStr = now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    exif[piexif.ExifIFD.DateTimeOriginal] = dateStr;
    exif[piexif.ExifIFD.DateTimeDigitized] = dateStr;
    
    // Create EXIF object
    const exifObj = {
        "0th": zeroth,
        "Exif": exif,
        "GPS": gps
    };
    
    // Convert to binary EXIF data
    const exifBytes = piexif.dump(exifObj);
    
    // Insert EXIF into JPEG
    const newDataUrl = piexif.insert(exifBytes, dataUrl);
    
    return newDataUrl;
}

function downloadImage(dataUrl, originalName) {
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    a.href = dataUrl;
    a.download = `protected_${timestamp}_${originalName.replace(/\.[^/.]+$/, '')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
