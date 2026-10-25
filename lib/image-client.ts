/**
 * Client-side image optimization helper.
 * Quickly resizes and compresses high-resolution camera / phone images
 * before upload, preventing upload stalls, timeouts, and massive file payloads.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1400,
  quality = 0.85
): Promise<{ compressedFile: File; dataUrl: string; width: number; height: number }> {
  // If running on server or unsupported type, fallback to original
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
    return {
      compressedFile: file,
      dataUrl: '',
      width: 0,
      height: 0,
    };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    // Safety timeout in case image decoding hangs on corrupted file
    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        compressedFile: file,
        dataUrl: '',
        width: 0,
        height: 0,
      });
    }, 5000);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve({ compressedFile: file, dataUrl: '', width, height });
          return;
        }

        // High quality rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer modern WebP or standard JPEG
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputType, quality);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name, {
                type: outputType,
                lastModified: Date.now(),
              });
              resolve({ compressedFile, dataUrl, width, height });
            } else {
              // If original was already smaller, keep original file with the dataUrl
              resolve({ compressedFile: file, dataUrl, width, height });
            }
          },
          outputType,
          quality
        );
      } catch (err) {
        console.warn('Canvas image compression note, falling back to original file:', err);
        URL.revokeObjectURL(objectUrl);
        resolve({ compressedFile: file, dataUrl: '', width: 0, height: 0 });
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
      resolve({ compressedFile: file, dataUrl: '', width: 0, height: 0 });
    };

    img.src = objectUrl;
  });
}
