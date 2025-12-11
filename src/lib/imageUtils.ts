/**
 * Image utility functions for handling product images
 * Validates, resizes, and converts images to base64 for localStorage storage
 */

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_WIDTH = 400;
const MAX_HEIGHT = 400;
const JPEG_QUALITY = 0.8;

/**
 * Validate if a file is a valid image and within size limits
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Please use JPG, PNG, or WebP images.' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` 
    };
  }

  return { valid: true };
}

/**
 * Resize an image and convert to base64 data URI
 * Automatically compresses to reduce storage size
 */
export function resizeImage(
  file: File,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 (JPEG for better compression)
        const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get dimensions of a base64 encoded image
 */
export function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = base64;
  });
}

/**
 * Process an image file for storage
 * Validates, resizes, and returns base64 string
 */
export async function processImageFile(file: File): Promise<string> {
  const validation = validateImageFile(file);
  
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const base64 = await resizeImage(file);
  return base64;
}
