/**
 * Image processing and compression utility for local device uploads
 * Automatically resizes large camera/gallery photos (e.g. 5-15MB) to high-quality
 * lightweight images (~100-250KB) that fit safely within Firestore 1MB limits
 * and load instantly on mobile networks.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  fileName: string;
  reductionPercentage: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function processAndCompressImage(
  file: File,
  maxWidth = 960,
  maxHeight = 960,
  quality = 0.75
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    // Basic verification
    const isImage =
      file.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name);

    if (!isImage) {
      reject(new Error('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, WebP, GIF)'));
      return;
    }

    const originalSize = file.size;
    const fileName = file.name;

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพจากอุปกรณ์ได้'));
    };

    reader.onload = (readerEvent) => {
      const resultData = readerEvent.target?.result as string;
      if (!resultData) {
        reject(new Error('เกิดข้อผิดพลาดในการโหลดรูปภาพ'));
        return;
      }

      // If it's a small GIF or SVG, preserve original as animating canvas loses frames
      if (
        (file.type === 'image/gif' || file.type === 'image/svg+xml') &&
        originalSize < 500 * 1024
      ) {
        resolve({
          dataUrl: resultData,
          width: 0,
          height: 0,
          originalSize,
          compressedSize: originalSize,
          fileName,
          reductionPercentage: 0,
        });
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback: if browser canvas cannot decode, return raw dataUrl if < 800KB
        if (originalSize < 800 * 1024) {
          resolve({
            dataUrl: resultData,
            width: 0,
            height: 0,
            originalSize,
            compressedSize: originalSize,
            fileName,
            reductionPercentage: 0,
          });
        } else {
          reject(new Error('อุปกรณ์ไม่รองรับการแปลงรูปภาพนี้ หรือขนาดไฟล์ใหญ่เกินไป'));
        }
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Downscale if exceeds max bounds
          if (width > maxWidth || height > maxHeight) {
            if (width / maxWidth > height / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback without canvas
            resolve({
              dataUrl: resultData,
              width: img.width,
              height: img.height,
              originalSize,
              compressedSize: originalSize,
              fileName,
              reductionPercentage: 0,
            });
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fill white background for transparent PNG converted to JPEG
          if (file.type !== 'image/png') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Output as JPEG for high compression ratio and universal Firestore compatibility
          // For PNG with transparency, keep PNG if small or use WebP
          let outputFormat = 'image/jpeg';
          if (file.type === 'image/png' && originalSize < 600 * 1024) {
            outputFormat = 'image/png';
          } else if (file.type === 'image/webp') {
            outputFormat = 'image/webp';
          }

          const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
          // Estimate base64 byte size
          const head = compressedDataUrl.indexOf(',') + 1;
          const compressedSize = Math.round(((compressedDataUrl.length - head) * 3) / 4);

          const reductionPercentage =
            originalSize > compressedSize
              ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
              : 0;

          resolve({
            dataUrl: compressedDataUrl,
            width,
            height,
            originalSize,
            compressedSize,
            fileName,
            reductionPercentage,
          });
        } catch (canvasErr) {
          console.warn('Canvas compression error, using raw data', canvasErr);
          resolve({
            dataUrl: resultData,
            width: img.width,
            height: img.height,
            originalSize,
            compressedSize: originalSize,
            fileName,
            reductionPercentage: 0,
          });
        }
      };

      img.src = resultData;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Re-compresses an existing data URL string if it exceeds a specified length
 * or dimensions. Essential for safeguarding Firestore 1MB document limit.
 */
export async function recompressDataUrl(
  dataUrl: string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.70
): Promise<string> {
  // If not a data URL or small enough (< 80KB), return as is
  if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.length < 80000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl); // fallback to original if decode fails
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      } catch (e) {
        console.warn('Failed to recompress data URL:', e);
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

