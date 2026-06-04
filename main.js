// main.js
document.addEventListener('DOMContentLoaded', () => {
    // ---------- Configuration ----------
    // GitHub Pages only serves static files, so the studio keeps image processing in the browser.
    // ---------- END Configuration ----------

    // ---------- Theme Toggle ----------
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    const setThemeIcons = (isDark) => {
        sunIcon?.classList.toggle('hidden', isDark);
        moonIcon?.classList.toggle('hidden', !isDark);
    };

    body.classList.toggle('dark', savedTheme !== 'light');
    setThemeIcons(body.classList.contains('dark'));

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        const isDark = body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        setThemeIcons(isDark);
    });

    // ---------- Tab Switching ----------
    const tabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.section');

    const activateTab = (tab) => {
        if (!tab) return;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const sectionId = tab.id.replace('tab-', 'section-');
        sections.forEach(s => s.classList.add('hidden'));
        document.getElementById(sectionId)?.classList.remove('hidden');
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab));
     });

    document.querySelectorAll('[data-open-tab]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            activateTab(document.getElementById(link.dataset.openTab));
            document.getElementById('studio')?.scrollIntoView({ block: 'start' });
        });
    });

    // ---------- DOM Elements Caching ----------
    // Common Elements
    const imageUpload = document.getElementById('imageUpload');
    const applyWatermarkBtn = document.getElementById('apply-watermark');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const previewImage = document.getElementById('preview-image');
    const noImageMessage = document.getElementById('no-image-message');
    const previewWrapper = document.getElementById('watermark-preview-wrapper');
    const previewContainer = document.getElementById('preview-container');
    const processingOverlay = document.getElementById('processing-overlay');
    const applyStatus = document.getElementById('apply-status');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar-fill');

    // Watermark Specific Controls
    const logoUpload = document.getElementById('logoUpload');
    const watermarkText = document.getElementById('watermarkText');
    const textColor = document.getElementById('textColor');
    const opacity = document.getElementById('opacity');
    const opacityValue = document.getElementById('opacityValue');
    const positionBtns = document.querySelectorAll('.position-btn');
    const watermarkTypeBtns = document.querySelectorAll('[data-wm-type]');
    const visibleOptions = document.getElementById('visible-watermark-options');
    const invisibleOptions = document.getElementById('invisible-watermark-options');
    const textOptions = document.getElementById('watermark-text-options');
    const logoOptions = document.getElementById('watermark-logo-options');
    const textColorOption = document.getElementById('text-color-option');
    const positionControls= document.getElementById('position-controls');
    // Tiling Controls
    const tileStyleSelect = document.getElementById('tileStyle');
    const tileSettingsContainer = document.getElementById('tile-settings');
    const tileSpacingSlider = document.getElementById('tileSpacing');
    const tileSpacingValue = document.getElementById('tileSpacingValue');
    const tileAngleOption = document.getElementById('tile-angle-option');
    const tileAngleSlider = document.getElementById('tileAngle');
    const tileAngleValue = document.getElementById('tileAngleValue');

    // Invisible Specific Controls
    const secretMessage = document.getElementById('secretMessage');
    const encodingStrength = document.getElementById('encodingStrength');
    const encodingStrengthValue = document.getElementById('encodingStrengthValue');
    const lsbBitsValue = document.getElementById('lsbBitsValue');
    const invisibleLogoUpload = document.getElementById('invisibleLogoUpload');
    const invTypeBtns = document.querySelectorAll('[data-inv-type]');
    const invTextOptions = document.getElementById('invisible-text-options');
    const invLogoOptions = document.getElementById('invisible-logo-options');

    // Reveal controls
    const extractImageUpload = document.getElementById('extractImageUpload');
    const revealDropzone = document.getElementById('reveal-dropzone');
    const extractionResult = document.getElementById('extraction-result');
    const extractedContent = document.getElementById('extracted-content');
    const extractedMessage = document.getElementById('extracted-message');
    const extractedImage = document.getElementById('extracted-image');
    const extractedPlaceholder = document.getElementById('extracted-placeholder');
    const extractedError = document.getElementById('extracted-error');
    const extractStatus = document.getElementById('extract-status');

    // Removal controls
    const removeImageUpload = document.getElementById('removeImageUpload');
    const removeWatermarkBtn = document.getElementById('remove-watermark-btn');
    const removeDownloadBtn = document.getElementById('remove-download-btn');
    const removeResetBtn = document.getElementById('remove-reset-btn');
    const removeStatus = document.getElementById('remove-status');
    const removePreviewContainer = document.getElementById('remove-preview-container');
    const removePreviewImage = document.getElementById('remove-preview-image');
    const noRemoveImageMessage = document.getElementById('no-remove-image-message');
    const removeComparison = document.getElementById('remove-comparison');
    const removeBeforeImage = document.getElementById('remove-before-image');
    const removeAfterImage = document.getElementById('remove-after-image');
    const removeCompareHandle = document.getElementById('remove-compare-handle');

    // ---------- State Variables ----------
    let originalImageFile = null;
    let originalImageDataUrl = null;
    let logoImageFile = null;
    let logoImageDataUrl = null;
    let watermarkedBlobUrl = null;
    let lastDownloadFilename = 'watermarked_image.png';
    let currentWatermarkType = 'visible-text';
    let currentInvisibleType = 'text';
    let currentPosition = 'center';
    let isProcessingApply = false;
    let isProcessingExtract = false;
    let isProcessingRemove = false;
    let removeImageFile = null;
    let removeImageDataUrl = null;
    let removedBlobUrl = null;
    let removeDownloadFilename = 'cleaned_image.png';
    let removeAutoRunTimer = null;

    // ---------- Helper Functions ----------
    const getLsbBits = (strength) => Math.min(8, Math.max(1, Math.ceil(parseInt(strength) * 8 / 5)));
    const LSB_SCAN_BITS = [5, 2, 4, 7, 8, 1, 3, 6];

    const getStrengthLabel = (strength) => {
        const labels = {
            1: 'Light',
            2: 'Low',
            3: 'Balanced',
            4: 'Strong',
            5: 'Maximum'
        };
        return labels[String(strength)] || 'Balanced';
    };

    const setStatus = (element, message, type = 'info', duration = 3000) => {
        const typeClasses = {
            info: 'info',
            success: 'success',
            error: 'error',
            processing: 'processing'
        };
        element.className = `text-xs text-center mt-2 h-4 font-medium ${typeClasses[type] || typeClasses['info']}`;
        element.textContent = message;
        if (duration > 0 && type !== 'processing') {
            setTimeout(() => {
                if (element.textContent === message) {
                    element.textContent = '';
                    element.className = 'text-xs text-center mt-2 h-4';
                }
            }, duration);
        }
    };

    const setButtonLoading = (button, isLoading) => {
        const textSpan = button.querySelector('.btn-text');
        const loadingIcon = button.querySelector('.btn-loading');
        if (isLoading) {
            button.disabled = true;
            textSpan?.classList.add('hidden');
            loadingIcon?.classList.remove('hidden');
        } else {
            button.disabled = false;
            textSpan?.classList.remove('hidden');
            loadingIcon?.classList.add('hidden');
        }
    };

    const setProgress = (barElement, containerElement, value, status = null) => {
        if (!containerElement || !barElement) return;
        containerElement.classList.remove('hidden');
        barElement.style.width = `${Math.max(0, Math.min(100, value))}%`;
        barElement.className = 'progress-bar-fill';
        if (status === 'success') barElement.classList.add('success');
        if (status === 'error') barElement.classList.add('error');

        if (value >= 100 || status === 'error') {
            setTimeout(() => {
                containerElement.classList.add('hidden');
                setTimeout(() => { barElement.style.width = `0%`; }, 300);
            }, 2000);
        } else if (value <= 0) {
            containerElement.classList.add('hidden');
            barElement.style.width = `0%`;
        }
    };

    const canRenderVisibleDownload = () => (
        Boolean(originalImageDataUrl) &&
        currentWatermarkType !== 'invisible' &&
        (currentWatermarkType !== 'visible-logo' || Boolean(logoImageDataUrl))
    );

    const setDownloadButtonState = (isEnabled, title) => {
        downloadBtn.disabled = !isEnabled;
        downloadBtn.title = title;
        downloadBtn.setAttribute('aria-disabled', String(!isEnabled));
    };

    const syncDownloadButtonState = () => {
        if (watermarkedBlobUrl) {
            setDownloadButtonState(true, 'Download the processed watermarked image');
            return;
        }

        if (canRenderVisibleDownload()) {
            setDownloadButtonState(true, 'Download the current watermarked preview');
            return;
        }

        if (!originalImageDataUrl) {
            setDownloadButtonState(false, 'Upload an image first');
            return;
        }

        if (currentWatermarkType === 'visible-logo' && !logoImageDataUrl) {
            setDownloadButtonState(false, 'Upload a logo before downloading');
            return;
        }

        setDownloadButtonState(false, 'Apply the invisible watermark before downloading');
    };

    const clearGeneratedDownload = () => {
        if (watermarkedBlobUrl) {
            URL.revokeObjectURL(watermarkedBlobUrl);
            watermarkedBlobUrl = null;
            if (originalImageDataUrl && previewImage.src !== originalImageDataUrl) {
                previewImage.src = originalImageDataUrl;
            }
        }
        syncDownloadButtonState();
    };

    const loadImageFromUrl = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not load image for download.'));
        img.src = src;
    });

    const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Could not generate downloadable image.'));
        }, type, quality);
    });

    const getDownloadFilename = () => {
        const baseName = originalImageFile?.name?.replace(/\.[^/.]+$/, '') || 'watermarked_image';
        const extension = originalImageFile?.type === 'image/jpeg' ? 'jpg' : 'png';
        return `${baseName}_stegamark.${extension}`;
    };

    const getSinglePosition = (canvasWidth, canvasHeight, markWidth, markHeight, padding) => {
        let x = (canvasWidth - markWidth) / 2;
        let y = (canvasHeight - markHeight) / 2;

        if (currentPosition.includes('left')) x = padding;
        if (currentPosition.includes('right')) x = canvasWidth - markWidth - padding;
        if (currentPosition.includes('top')) y = padding;
        if (currentPosition.includes('bottom')) y = canvasHeight - markHeight - padding;

        return {
            x: Math.max(0, Math.min(x, canvasWidth - markWidth)),
            y: Math.max(0, Math.min(y, canvasHeight - markHeight))
        };
    };

    const renderVisibleWatermarkToBlob = async () => {
        if (!canRenderVisibleDownload()) {
            throw new Error(currentWatermarkType === 'visible-logo' ? 'Upload a logo before downloading.' : 'Upload an image first.');
        }

        const baseImage = await loadImageFromUrl(originalImageDataUrl);
        const canvas = document.createElement('canvas');
        canvas.width = baseImage.naturalWidth || baseImage.width;
        canvas.height = baseImage.naturalHeight || baseImage.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, parseFloat(opacity.value) / 100));

        const padding = Math.max(16, Math.round(Math.min(canvas.width, canvas.height) * 0.035));
        let markWidth = 0;
        let markHeight = 0;
        let drawMark;

        if (currentWatermarkType === 'visible-text') {
            const text = watermarkText.value || '\u00A9 StegaMark';
            const fontSize = Math.max(18, Math.round(canvas.height * 0.05));
            ctx.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
            ctx.textBaseline = 'top';
            ctx.fillStyle = textColor.value || '#EDEAE4';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.58)';
            ctx.shadowBlur = Math.max(2, fontSize * 0.08);
            ctx.shadowOffsetX = Math.max(1, fontSize * 0.04);
            ctx.shadowOffsetY = Math.max(1, fontSize * 0.04);

            const metrics = ctx.measureText(text);
            markWidth = metrics.width;
            markHeight = Math.max(fontSize, (metrics.actualBoundingBoxAscent || fontSize) + (metrics.actualBoundingBoxDescent || 0));
            drawMark = (x, y, angle = 0) => {
                ctx.save();
                ctx.translate(x + markWidth / 2, y + markHeight / 2);
                ctx.rotate(angle);
                ctx.fillText(text, -markWidth / 2, -markHeight / 2);
                ctx.restore();
            };
        } else {
            const logoImage = await loadImageFromUrl(logoImageDataUrl);
            const scale = Math.max(0.05, Math.min(0.5, parseFloat(document.getElementById('logoScale')?.value || '15') / 100));
            markWidth = canvas.width * scale;
            markHeight = markWidth * ((logoImage.naturalHeight || logoImage.height) / (logoImage.naturalWidth || logoImage.width));
            drawMark = (x, y, angle = 0) => {
                ctx.save();
                ctx.translate(x + markWidth / 2, y + markHeight / 2);
                ctx.rotate(angle);
                ctx.drawImage(logoImage, -markWidth / 2, -markHeight / 2, markWidth, markHeight);
                ctx.restore();
            };
        }

        const tileStyle = tileStyleSelect?.value || 'none';
        if (tileStyle === 'none') {
            const { x, y } = getSinglePosition(canvas.width, canvas.height, markWidth, markHeight, padding);
            drawMark(x, y);
        } else {
            const spacing = parseFloat(tileSpacingSlider?.value || '10') / 100;
            const stepX = Math.max(markWidth + padding, markWidth * (1.35 + spacing));
            const stepY = Math.max(markHeight + padding, markHeight * (1.7 + spacing));
            const angle = tileStyle === 'diagonal' ? (parseFloat(tileAngleSlider?.value || '45') * Math.PI / 180) : 0;
            let row = 0;

            for (let y = -markHeight; y < canvas.height + markHeight; y += stepY) {
                const stagger = tileStyle === 'staggered' && row % 2 ? stepX / 2 : 0;
                for (let x = -markWidth + stagger; x < canvas.width + markWidth; x += stepX) {
                    drawMark(x, y, angle);
                }
                row += 1;
            }
        }

        ctx.restore();

        const outputType = originalImageFile?.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        const blob = await canvasToBlob(canvas, outputType, outputType === 'image/jpeg' ? 0.94 : undefined);
        return {
            blob,
            filename: getDownloadFilename()
        };
    };

    const LSB_DELIMITER_BYTES = new Uint8Array([60, 1, 83, 84, 71, 2, 77, 82, 75, 3, 69, 78, 68, 62]);
    const LSB_RGB_CHANNELS = [0, 1, 2];
    const LSB_RGBA_CHANNELS = [0, 1, 2, 3];

    const bytesToBase64 = (bytes) => {
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        return btoa(binary);
    };

    const bytesEndWith = (bytes, suffix) => {
        if (bytes.length < suffix.length) return false;
        const offset = bytes.length - suffix.length;
        for (let i = 0; i < suffix.length; i += 1) {
            if (bytes[offset + i] !== suffix[i]) return false;
        }
        return true;
    };

    const readFileAsBytes = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = () => reject(new Error('Could not read the selected file.'));
        reader.readAsArrayBuffer(file);
    });

    const getImageDataFromUrl = async (src) => {
        const image = await loadImageFromUrl(src);
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        return {
            canvas,
            ctx,
            imageData: ctx.getImageData(0, 0, canvas.width, canvas.height)
        };
    };

    const getLsbPayload = async () => {
        if (currentInvisibleType === 'text') {
            const content = secretMessage.value.trim();
            if (!content) throw new Error('Please enter text to hide.');
            return {
                watermark_type: 'text',
                content,
                encoding: 'utf-8',
                app: 'StegaMark',
                version: '3'
            };
        }

        const logoFile = invisibleLogoUpload.files?.[0];
        if (!logoFile || logoFile.type !== 'image/png') {
            throw new Error('Please upload a PNG logo to hide.');
        }

        const logoBytes = await readFileAsBytes(logoFile);
        return {
            watermark_type: 'image',
            format: 'png',
            mime_type: 'image/png',
            filename: logoFile.name,
            content: bytesToBase64(logoBytes),
            app: 'StegaMark',
            version: '3'
        };
    };

    const encodeLsbPayload = async () => {
        const payload = await getLsbPayload();
        const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
        const bitsToUse = getLsbBits(encodingStrength.value);
        const { canvas, ctx, imageData } = await getImageDataFromUrl(originalImageDataUrl);
        const data = imageData.data;
        const totalBytes = payloadBytes.length + LSB_DELIMITER_BYTES.length;
        const capacityBytes = Math.floor((data.length / 4 * LSB_RGB_CHANNELS.length * bitsToUse) / 8) - LSB_DELIMITER_BYTES.length;

        if (payloadBytes.length > capacityBytes) {
            throw new Error(`Hidden data is too large for this image. Capacity is ${Math.max(0, capacityBytes)} bytes at the current strength.`);
        }

        const bytesToHide = new Uint8Array(totalBytes);
        bytesToHide.set(payloadBytes);
        bytesToHide.set(LSB_DELIMITER_BYTES, payloadBytes.length);

        const totalBits = bytesToHide.length * 8;
        const clearMask = 0xFF << bitsToUse & 0xFF;
        let bitIndex = 0;

        for (let pixelIndex = 0; pixelIndex < data.length && bitIndex < totalBits; pixelIndex += 4) {
            for (const channelOffset of LSB_RGB_CHANNELS) {
                if (bitIndex >= totalBits) break;

                let bitsValue = 0;
                for (let i = 0; i < bitsToUse; i += 1) {
                    bitsValue <<= 1;
                    if (bitIndex < totalBits) {
                        const byteValue = bytesToHide[bitIndex >> 3];
                        bitsValue |= (byteValue >> (7 - (bitIndex % 8))) & 1;
                        bitIndex += 1;
                    }
                }

                data[pixelIndex + channelOffset] = (data[pixelIndex + channelOffset] & clearMask) | bitsValue;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        const blob = await canvasToBlob(canvas, 'image/png');
        return {
            blob,
            filename: `${originalImageFile.name.replace(/\.[^/.]+$/, '')}_lsb.png`,
            payloadType: payload.watermark_type
        };
    };

    const decodeLsbBytesFromImageData = (imageData, bitsToUse, channelOffsets) => {
        const writeMask = (1 << bitsToUse) - 1;
        const extracted = [];
        let currentByte = 0;
        let bitCount = 0;

        for (let pixelIndex = 0; pixelIndex < imageData.data.length; pixelIndex += 4) {
            for (const channelOffset of channelOffsets) {
                const bitsValue = imageData.data[pixelIndex + channelOffset] & writeMask;
                for (let i = bitsToUse - 1; i >= 0; i -= 1) {
                    currentByte = (currentByte << 1) | ((bitsValue >> i) & 1);
                    bitCount += 1;

                    if (bitCount === 8) {
                        extracted.push(currentByte);
                        if (bytesEndWith(extracted, LSB_DELIMITER_BYTES)) {
                            return new Uint8Array(extracted.slice(0, -LSB_DELIMITER_BYTES.length));
                        }
                        currentByte = 0;
                        bitCount = 0;
                    }
                }
            }
        }

        throw new Error('Delimiter not found. Try the matching strength or a StegaMark PNG with hidden data.');
    };

    const parseLsbPayload = (payloadBytes, bitsUsed, channelsUsed) => {
        const decodedText = new TextDecoder().decode(payloadBytes);
        const resultMeta = {
            bits_used: bitsUsed,
            channels_used: channelsUsed
        };

        try {
            const metadata = JSON.parse(decodedText);
            if (metadata.watermark_type === 'text') {
                return {
                    extracted_text: String(metadata.content ?? ''),
                    ...resultMeta
                };
            }
            if (metadata.watermark_type === 'image' && metadata.content) {
                return {
                    extracted_text: metadata.filename ? `Image watermark detected: ${metadata.filename}` : 'Image watermark detected',
                    is_image: true,
                    image_data: metadata.content,
                    ...resultMeta
                };
            }
        } catch {
            return {
                extracted_text: decodedText,
                ...resultMeta
            };
        }

        return {
            extracted_text: decodedText,
            ...resultMeta
        };
    };

    const decodeLsbPayload = async (file) => {
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = () => reject(new Error('Could not read the reveal image.'));
            reader.readAsDataURL(file);
        });
        const { imageData } = await getImageDataFromUrl(dataUrl);
        for (const bitsToUse of LSB_SCAN_BITS) {
            try {
                const payloadBytes = decodeLsbBytesFromImageData(imageData, bitsToUse, LSB_RGB_CHANNELS);
                return parseLsbPayload(payloadBytes, bitsToUse, 'RGB');
            } catch {
            }
            try {
                const payloadBytes = decodeLsbBytesFromImageData(imageData, bitsToUse, LSB_RGBA_CHANNELS);
                return parseLsbPayload(payloadBytes, bitsToUse, 'RGBA');
            } catch {
            }
        }

        throw new Error('No hidden StegaMark payload found. Use a PNG exported from the LSB tool.');
    };

    const resetPreviewArea = () => {
        previewImage.src = '';
        previewImage.removeAttribute('style');
        previewWrapper.classList.add('hidden');
        noImageMessage.classList.remove('hidden');
        clearGeneratedDownload();
        setDownloadButtonState(false, 'Upload an image first');
        applyStatus.textContent = '';
        const existingOverlays = previewWrapper.querySelectorAll('.visual-watermark-overlay');
        existingOverlays.forEach(el => el.remove());
        setProgress(progressBar, progressContainer, 0);
    };

    const resetRevealArea = () => {
        if (extractImageUpload) extractImageUpload.value = '';
        extractionResult.classList.add('hidden');
        extractedContent.querySelectorAll(':scope > *').forEach(el => el.classList.add('hidden'));
        extractedPlaceholder.classList.remove('hidden');
        extractedPlaceholder.textContent = 'No data revealed yet.';
        extractedImage.removeAttribute('src');
        extractStatus.textContent = '';
    };

    const resetRemoveArea = () => {
        if (removeImageUpload) removeImageUpload.value = '';
        removeImageFile = null;
        removeImageDataUrl = null;
        if (removeAutoRunTimer) {
            clearTimeout(removeAutoRunTimer);
            removeAutoRunTimer = null;
        }
        if (removedBlobUrl) {
            URL.revokeObjectURL(removedBlobUrl);
            removedBlobUrl = null;
        }
        removeDownloadFilename = 'cleaned_image.png';
        removePreviewImage.src = '';
        removePreviewImage.classList.add('hidden');
        removeBeforeImage.removeAttribute('src');
        removeAfterImage.removeAttribute('src');
        removeComparison.classList.add('hidden');
        removeComparison.style.setProperty('--compare-position', '50%');
        noRemoveImageMessage.classList.remove('hidden');
        removeWatermarkBtn.disabled = true;
        removeDownloadBtn.disabled = true;
        removeStatus.textContent = '';
    };

    function updateTilingUI() {
        if (!tileStyleSelect || !positionControls || !tileSettingsContainer || !tileAngleOption) return;

        const selectedStyle = tileStyleSelect.value;
        const isTiling = selectedStyle !== 'none';

        positionControls.classList.toggle('hidden', isTiling);
        tileSettingsContainer.classList.toggle('hidden', !isTiling);
        tileAngleOption.classList.toggle('hidden', selectedStyle !== 'diagonal');
    }

    const resetAll = () => {
        imageUpload.value = '';
        logoUpload.value = '';
        invisibleLogoUpload.value = '';
        originalImageFile = null;
        originalImageDataUrl = null;
        logoImageFile = null; logoImageDataUrl = null;
        clearGeneratedDownload();
        lastDownloadFilename = 'watermarked_image.png';
        isProcessingApply = false;
        isProcessingExtract = false;
        isProcessingRemove = false;
        resetPreviewArea();
        resetRevealArea();
        resetRemoveArea();
        applyWatermarkBtn.disabled = true;
        watermarkText.value = '\u00A9 StegaMark';
        secretMessage.value = 'StegaMark Hidden Message';
        opacity.value = 50; opacityValue.textContent = '50%';
        textColor.value = '#EDEAE4';
        encodingStrength.value = 3; encodingStrengthValue.textContent = getStrengthLabel(3); lsbBitsValue.textContent = getLsbBits(3);
        positionBtns.forEach(b => b.classList.remove('active'));
        const centerBtn = document.querySelector('.position-btn[data-position="center"]');
        if (centerBtn) centerBtn.classList.add('active');
        currentPosition = 'center';

        // Reset tiling controls.
        if (tileStyleSelect) tileStyleSelect.value = 'none';
        if (tileSpacingSlider) tileSpacingSlider.value = 10;
        if (tileSpacingValue) tileSpacingValue.textContent = '10%';
        if (tileAngleSlider) tileAngleSlider.value = 45;
        if (tileAngleValue) tileAngleValue.textContent = '45\u00B0';

        currentWatermarkType = 'visible-text';
        watermarkTypeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.wmType === currentWatermarkType));
        currentInvisibleType = 'text';
        invTypeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.invType === currentInvisibleType));
        updateWatermarkTypeUI();
    };

    const updatePreviewWatermark = () => {
        if (!previewWrapper || previewWrapper.classList.contains('hidden')) return;
        const existingOverlays = previewWrapper.querySelectorAll('.visual-watermark-overlay');
        existingOverlays.forEach(el => el.remove());
        if (!originalImageDataUrl || currentWatermarkType === 'invisible') {
            return;
        }
        if (currentWatermarkType === 'visible-logo' && !logoImageDataUrl) {
             return;
        }

        const imgElement = previewImage;
        const container = previewWrapper;

         if (imgElement.naturalWidth === 0 && imgElement.src) {
             imgElement.onload = () => { updatePreviewWatermark(); imgElement.onload = null; };
             return;
         } else if (!imgElement.src){
             return;
         }

        const imgRect = imgElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (imgRect.width <= 0 || imgRect.height <= 0) {
            console.warn("Preview image has zero dimensions.");
            return;
        }

        const overlay = document.createElement('div');
        overlay.classList.add('visual-watermark-overlay');
        overlay.style.position = 'absolute';
        overlay.style.pointerEvents = 'none';
        overlay.style.opacity = opacity.value / 100;
        overlay.style.visibility = 'hidden';
        let watermarkWidth = 0, watermarkHeight = 0;
        const padding = 10 * (imgRect.width / imgElement.naturalWidth);

        if (currentWatermarkType === 'visible-text') {
            overlay.textContent = watermarkText.value || '\u00A9 StegaMark';
            overlay.style.color = textColor.value;
            const baseFontSize = Math.max(10, imgRect.height * 0.05);
            overlay.style.fontSize = `${baseFontSize}px`;
            overlay.style.fontFamily = 'Poppins, Arial, sans-serif';
            overlay.style.fontWeight = '600';
            overlay.style.whiteSpace = 'nowrap';
            overlay.style.textShadow = '1px 1px 2px rgba(0,0,0,0.6)';
            previewWrapper.appendChild(overlay);
            watermarkWidth = overlay.offsetWidth;
            watermarkHeight = overlay.offsetHeight;
            positionAndShowOverlay(overlay, watermarkWidth, watermarkHeight, imgRect, containerRect, padding);

        } else if (currentWatermarkType === 'visible-logo' && logoImageDataUrl) {
            const logoImg = new Image();
            logoImg.onload = () => {
                const targetWidth = imgRect.width * 0.15;
                const aspectRatio = logoImg.naturalHeight / logoImg.naturalWidth;
                const targetHeight = targetWidth * aspectRatio;
                overlay.style.width = `${targetWidth}px`;
                overlay.style.height = `${targetHeight}px`;
                overlay.style.backgroundImage = `url(${logoImageDataUrl})`;
                overlay.style.backgroundSize = 'contain';
                overlay.style.backgroundRepeat = 'no-repeat';
                watermarkWidth = targetWidth;
                watermarkHeight = targetHeight;
                previewWrapper.appendChild(overlay);
                positionAndShowOverlay(overlay, watermarkWidth, watermarkHeight, imgRect, containerRect, padding);
            };
            logoImg.onerror = () => console.error("Failed to load logo for preview overlay.");
            logoImg.src = logoImageDataUrl;
        }
    };

     function positionAndShowOverlay(overlay, wmWidth, wmHeight, imgRect, containerRect, padding) {
         const offsetX = (containerRect.width - imgRect.width) / 2;
         const offsetY = (containerRect.height - imgRect.height) / 2;
         let left, top;
         if (currentPosition.includes('left')) left = offsetX + padding;
         else if (currentPosition.includes('right')) left = offsetX + imgRect.width - wmWidth - padding;
         else left = offsetX + (imgRect.width - wmWidth) / 2;
         if (currentPosition.includes('top')) top = offsetY + padding;
         else if (currentPosition.includes('bottom')) top = offsetY + imgRect.height - wmHeight - padding;
         else top = offsetY + (imgRect.height - wmHeight) / 2;
         left = Math.max(0, Math.min(left, containerRect.width - wmWidth));
         top = Math.max(0, Math.min(top, containerRect.height - wmHeight));
         overlay.style.left = `${left}px`;
         overlay.style.top = `${top}px`;
         overlay.style.visibility = 'visible';
     }

    // ---------- Event Listeners Setup ----------

    const setSourceImageInputFile = (file) => {
        try {
            const transfer = new DataTransfer();
            transfer.items.add(file);
            imageUpload.files = transfer.files;
        } catch (error) {
            console.warn('Could not sync dropped file to input element.', error);
        }
    };

    const loadSourceImageFile = (file, syncInput = false) => {
        if (file && /^image\/(png|jpeg)$/.test(file.type)) {
            originalImageFile = file;
            if (syncInput) setSourceImageInputFile(file);

            const reader = new FileReader();
            reader.onload = (ev) => {
                originalImageDataUrl = ev.target.result;
                const imgElement = previewImage;
                imgElement.onload = () => {
                    noImageMessage.classList.add('hidden');
                    previewWrapper.classList.remove('hidden');
                    updatePreviewWatermark();
                    imgElement.onload = null;
                    applyWatermarkBtn.disabled = false;
                    clearGeneratedDownload();
                    setStatus(applyStatus, 'Image loaded.', 'info', 1500);
                };
                imgElement.onerror = () => {
                    setStatus(applyStatus, 'Error loading image preview.', 'error');
                    resetPreviewArea();
                };
                imgElement.src = originalImageDataUrl;
            };
            reader.onerror = () => {
                setStatus(applyStatus, 'Error reading image file.', 'error');
                resetPreviewArea();
            };
            reader.readAsDataURL(originalImageFile);
        } else {
            originalImageFile = null;
            originalImageDataUrl = null;
            resetPreviewArea();
            applyWatermarkBtn.disabled = true;
            if (file) {
                setStatus(applyStatus, 'Please select a valid image file (PNG or JPG).', 'error');
            }
        }
    };

    imageUpload.addEventListener('change', (e) => {
        loadSourceImageFile(e.target.files?.[0] || null);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        previewContainer.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
            previewContainer.classList.add('is-drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        previewContainer.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
            previewContainer.classList.remove('is-drag-over');
        });
    });

    previewContainer.addEventListener('drop', (event) => {
        const file = event.dataTransfer?.files?.[0] || null;
        loadSourceImageFile(file, true);
    });

    previewContainer.addEventListener('click', () => {
        if (!isProcessingApply) imageUpload.click();
    });

    logoUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0] && e.target.files[0].type.startsWith('image/')) { // Allow more logo types
            logoImageFile = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                logoImageDataUrl = ev.target.result;
                clearGeneratedDownload();
                if (currentWatermarkType === 'visible-logo') updatePreviewWatermark();
                setStatus(applyStatus, `Logo loaded.`, 'info', 1500);
            };
            reader.onerror = () => setStatus(applyStatus, `Error reading logo file.`, 'error');
            reader.readAsDataURL(logoImageFile);
        } else {
            logoImageFile = null;
            logoImageDataUrl = null;
            clearGeneratedDownload();
            if (currentWatermarkType === 'visible-logo') updatePreviewWatermark();
            if(e.target.files && e.target.files[0]) {
                setStatus(applyStatus, `Please select a valid image file for the logo.`, 'error');
            }
        }
    });

    invisibleLogoUpload.addEventListener('change', (e) => {
         if (e.target.files && e.target.files[0] && e.target.files[0].type === 'image/png') {
             setStatus(applyStatus, 'Invisible logo selected for LSB embedding.', 'info', 2000);
         } else {
             if (e.target.files && e.target.files[0]){
                 setStatus(applyStatus, 'Please select a PNG file for the invisible logo.', 'error');
             }
         }
         clearGeneratedDownload();
    });


    watermarkTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
             watermarkTypeBtns.forEach(b => b.classList.remove('active'));
             btn.classList.add('active');
             currentWatermarkType = btn.dataset.wmType;
             updateWatermarkTypeUI();
         });
    });
     invTypeBtns.forEach(btn => {
         btn.addEventListener('click', () => {
             invTypeBtns.forEach(b => b.classList.remove('active'));
             btn.classList.add('active');
             currentInvisibleType = btn.dataset.invType;
             updateInvisibleTypeUI();
         });
     });

    function updateWatermarkTypeUI() {
        const isVisible = currentWatermarkType.startsWith('visible');
        visibleOptions.classList.toggle('hidden', !isVisible);
        invisibleOptions.classList.toggle('hidden', isVisible);

         if (isVisible) {
             logoOptions.classList.toggle('hidden', currentWatermarkType !== 'visible-logo');
             textOptions.classList.toggle('hidden', currentWatermarkType !== 'visible-text');
             textColorOption.classList.toggle('hidden', currentWatermarkType !== 'visible-text');
             updateTilingUI();
         } else {
             if (positionControls) positionControls.classList.add('hidden');
             if (tileSettingsContainer) tileSettingsContainer.classList.add('hidden');
             updateInvisibleTypeUI();
         }
         updatePreviewWatermark();
         clearGeneratedDownload();
    }

     function updateInvisibleTypeUI() {
        if (currentWatermarkType === 'invisible') {
             invTextOptions.classList.toggle('hidden', currentInvisibleType !== 'text');
             invLogoOptions.classList.toggle('hidden', currentInvisibleType !== 'logo');
             if(currentInvisibleType === 'logo' && applyStatus){
                 setStatus(applyStatus, 'Upload a PNG logo to hide inside the source image.', 'info', 3500);
             }
        }
        clearGeneratedDownload();
     }

    [watermarkText, textColor, opacity].forEach(el => {
        el?.addEventListener('input', () => {
            clearGeneratedDownload();
            if (el.id === 'opacity') opacityValue.textContent = `${opacity.value}%`;
            updatePreviewWatermark();
        });
    });

    if (tileStyleSelect) {
        tileStyleSelect.addEventListener('change', () => {
            updateTilingUI();
            clearGeneratedDownload();
        });
    }

    if (tileSpacingSlider) {
        tileSpacingSlider.addEventListener('input', (e) => {
            if (tileSpacingValue) tileSpacingValue.textContent = `${e.target.value}%`;
            clearGeneratedDownload();
        });
    }

    if (tileAngleSlider) {
        tileAngleSlider.addEventListener('input', (e) => {
            if (tileAngleValue) tileAngleValue.textContent = `${e.target.value}\u00B0`;
            clearGeneratedDownload();
        });
    }

    encodingStrength.addEventListener('input', () => {
        const value = encodingStrength.value;
        encodingStrengthValue.textContent = getStrengthLabel(value);
        lsbBitsValue.textContent = getLsbBits(value);
        clearGeneratedDownload();
    });

    positionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            positionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPosition = btn.dataset.position;
             clearGeneratedDownload();
             updatePreviewWatermark();
        });
    });

    // Apply watermark.
    applyWatermarkBtn.addEventListener('click', async () => {
        if (isProcessingApply || !originalImageFile) return;

        if (currentWatermarkType === 'visible-logo' && !logoImageFile) {
            setStatus(applyStatus, 'Please upload a logo image.', 'error'); return;
        }
        if (currentWatermarkType === 'invisible' && currentInvisibleType === 'text' && !secretMessage.value.trim()) {
            setStatus(applyStatus, 'Please enter text to hide.', 'error'); return;
        }
        if (currentWatermarkType === 'invisible' && currentInvisibleType === 'logo') {
            const logoFile = invisibleLogoUpload.files?.[0];
            if (!logoFile || logoFile.type !== 'image/png') {
                setStatus(applyStatus, 'Please upload a PNG logo to hide.', 'error'); return;
            }
        }

        isProcessingApply = true;
        setButtonLoading(applyWatermarkBtn, true);
        processingOverlay.classList.remove('hidden');
        setStatus(applyStatus, 'Processing...', 'processing', 0);
        setProgress(progressBar, progressContainer, 10);
        if (watermarkedBlobUrl) {
            URL.revokeObjectURL(watermarkedBlobUrl);
            watermarkedBlobUrl = null;
        }
        setDownloadButtonState(false, 'Processing watermark...');

        if (currentWatermarkType === 'invisible') {
            try {
                await new Promise(resolve => setTimeout(resolve, 120));
                setProgress(progressBar, progressContainer, 35);
                const { blob, filename, payloadType } = await encodeLsbPayload();
                await new Promise(resolve => setTimeout(resolve, 120));
                setProgress(progressBar, progressContainer, 80);

                watermarkedBlobUrl = URL.createObjectURL(blob);
                lastDownloadFilename = filename;
                previewImage.src = watermarkedBlobUrl;
                noImageMessage.classList.add('hidden');
                previewWrapper.classList.remove('hidden');
                setStatus(applyStatus, `LSB ${payloadType === 'image' ? 'logo' : 'text'} embedded. Download the PNG to preserve it.`, 'success');
                setProgress(progressBar, progressContainer, 100, 'success');
                syncDownloadButtonState();
            } catch (error) {
                console.error('LSB Encode Error:', error);
                setStatus(applyStatus, error.message, 'error');
                setProgress(progressBar, progressContainer, 100, 'error');
                syncDownloadButtonState();
            } finally {
                isProcessingApply = false;
                setButtonLoading(applyWatermarkBtn, false);
                processingOverlay.classList.add('hidden');
            }
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 120));
            setProgress(progressBar, progressContainer, 40);

            const { blob, filename } = await renderVisibleWatermarkToBlob();

            await new Promise(resolve => setTimeout(resolve, 120));
            setProgress(progressBar, progressContainer, 80);

            watermarkedBlobUrl = URL.createObjectURL(blob);
            lastDownloadFilename = filename;
            previewImage.src = watermarkedBlobUrl;
            noImageMessage.classList.add('hidden');
            previewWrapper.classList.remove('hidden');
            setStatus(applyStatus, 'Watermark applied in your browser. Download is ready.', 'success');
            setProgress(progressBar, progressContainer, 100, 'success');
            syncDownloadButtonState();
        } catch (error) {
            console.error('Visible Watermark Render Error:', error);
            setStatus(applyStatus, error.message || 'Could not apply the watermark in this browser.', 'error');
            setProgress(progressBar, progressContainer, 100, 'error');
            syncDownloadButtonState();
        } finally {
            isProcessingApply = false;
            setButtonLoading(applyWatermarkBtn, false);
            processingOverlay.classList.add('hidden');
        }
    });


    // Download Button Listener - Uses backend Blob URL or renders visible marks locally.
    downloadBtn.addEventListener('click', async () => {
        if (!watermarkedBlobUrl) {
            if (!canRenderVisibleDownload()) {
                syncDownloadButtonState();
                return;
            }

            try {
                setDownloadButtonState(false, 'Preparing download...');
                const { blob, filename } = await renderVisibleWatermarkToBlob();
                watermarkedBlobUrl = URL.createObjectURL(blob);
                lastDownloadFilename = filename;
            } catch (error) {
                console.error('Visible Download Error:', error);
                setStatus(applyStatus, error.message, 'error');
                syncDownloadButtonState();
                return;
            }
        }

        const link = document.createElement('a');
        link.download = lastDownloadFilename;
        link.href = watermarkedBlobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        syncDownloadButtonState();
        setStatus(applyStatus, 'Download started.', 'info', 1500);
    });

     // Reset Button Listener
    resetBtn.addEventListener('click', resetAll);

    const setInputFile = (input, file) => {
        try {
            const transfer = new DataTransfer();
            transfer.items.add(file);
            input.files = transfer.files;
        } catch (error) {
            console.warn('Could not sync dropped file to input element.', error);
        }
    };

    const bindDropzone = (dropzone, onFile) => {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (event) => {
                event.preventDefault();
                event.stopPropagation();
                dropzone.classList.add('is-drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (event) => {
                event.preventDefault();
                event.stopPropagation();
                dropzone.classList.remove('is-drag-over');
            });
        });

        dropzone.addEventListener('drop', (event) => {
            const file = event.dataTransfer?.files?.[0] || null;
            if (file) onFile(file, true);
        });
    };

    const revealHiddenData = async (file, syncInput = false) => {
        if (isProcessingExtract) return;
        if (!file || file.type !== 'image/png') {
            setStatus(extractStatus, 'Drop a PNG exported from StegaMark.', 'error');
            return;
        }

        if (syncInput) setInputFile(extractImageUpload, file);
        isProcessingExtract = true;
        resetRevealArea();
        setStatus(extractStatus, 'Checking hidden data...', 'processing', 0);

        try {
            await new Promise(resolve => setTimeout(resolve, 80));
            const resultData = await decodeLsbPayload(file);
            extractionResult.classList.remove('hidden');
            extractedPlaceholder.classList.add('hidden');
            extractedError.classList.add('hidden');

            if (resultData.is_image && resultData.image_data) {
                extractedMessage.textContent = resultData.extracted_text || 'Image watermark detected';
                extractedImage.src = `data:image/png;base64,${resultData.image_data}`;
                extractedMessage.classList.remove('hidden');
                extractedImage.classList.remove('hidden');
            } else {
                extractedMessage.textContent = resultData.extracted_text || '';
                extractedMessage.classList.toggle('hidden', !resultData.extracted_text);
                if (!resultData.extracted_text) {
                    extractedPlaceholder.textContent = 'Revealed an empty text message.';
                    extractedPlaceholder.classList.remove('hidden');
                }
            }

            setStatus(extractStatus, `Found payload at ${resultData.bits_used} LSBs (${resultData.channels_used}).`, 'success');
        } catch (error) {
            console.error('LSB Reveal Error:', error);
            extractionResult.classList.remove('hidden');
            extractedPlaceholder.classList.add('hidden');
            extractedMessage.classList.add('hidden');
            extractedImage.classList.add('hidden');
            extractedError.textContent = error.message;
            extractedError.classList.remove('hidden');
            setStatus(extractStatus, error.message, 'error');
        } finally {
            isProcessingExtract = false;
        }
    };

    extractImageUpload.addEventListener('change', (event) => {
        revealHiddenData(event.target.files?.[0] || null);
    });

    bindDropzone(revealDropzone, revealHiddenData);

    const loadRemoveImageFile = (file, syncInput = false) => {
        if (!file || !/^image\/(png|jpeg)$/.test(file.type)) {
            resetRemoveArea();
            if (file) setStatus(removeStatus, 'Drop a PNG or JPG image.', 'error');
            return;
        }

        removeImageFile = file;
        if (syncInput) setInputFile(removeImageUpload, file);

        const reader = new FileReader();
        reader.onload = (event) => {
            removeImageDataUrl = event.target.result;
            if (removedBlobUrl) {
                URL.revokeObjectURL(removedBlobUrl);
                removedBlobUrl = null;
            }
            removePreviewImage.src = removeImageDataUrl;
            removePreviewImage.classList.remove('hidden');
            removeBeforeImage.src = removeImageDataUrl;
            removeAfterImage.removeAttribute('src');
            removeComparison.classList.add('hidden');
            removeComparison.style.setProperty('--compare-position', '50%');
            noRemoveImageMessage.classList.add('hidden');
            removeDownloadBtn.disabled = true;
            removeWatermarkBtn.disabled = false;
            setStatus(removeStatus, 'Image loaded. Cleaning now...', 'processing', 0);
            if (removeAutoRunTimer) clearTimeout(removeAutoRunTimer);
            removeAutoRunTimer = setTimeout(() => {
                removeAutoRunTimer = null;
                applyRemoval();
            }, 120);
        };
        reader.onerror = () => {
            resetRemoveArea();
            setStatus(removeStatus, 'Could not read that image.', 'error');
        };
        reader.readAsDataURL(file);
    };

    const setComparePosition = (clientX) => {
        const rect = removeComparison.getBoundingClientRect();
        if (!rect.width) return;
        const position = clampValue(((clientX - rect.left) / rect.width) * 100, 3, 97);
        removeComparison.style.setProperty('--compare-position', `${position}%`);
    };

    const startCompareDrag = (event) => {
        if (removeComparison.classList.contains('hidden')) return;
        event.preventDefault();
        setComparePosition(event.clientX);
        removeComparison.setPointerCapture?.(event.pointerId);
    };

    const moveCompareDrag = (event) => {
        if (!removeComparison.hasPointerCapture?.(event.pointerId)) return;
        event.preventDefault();
        setComparePosition(event.clientX);
    };

    const getLuma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

    const boxBlurFloat = (values, width, height, radius) => {
        const temp = new Float32Array(values.length);
        const output = new Float32Array(values.length);

        for (let y = 0; y < height; y += 1) {
            let sum = 0;
            let count = 0;
            const row = y * width;
            for (let x = -radius; x <= radius; x += 1) {
                if (x >= 0 && x < width) {
                    sum += values[row + x];
                    count += 1;
                }
            }
            for (let x = 0; x < width; x += 1) {
                temp[row + x] = sum / count;
                const left = x - radius;
                const right = x + radius + 1;
                if (left >= 0) {
                    sum -= values[row + left];
                    count -= 1;
                }
                if (right < width) {
                    sum += values[row + right];
                    count += 1;
                }
            }
        }

        for (let x = 0; x < width; x += 1) {
            let sum = 0;
            let count = 0;
            for (let y = -radius; y <= radius; y += 1) {
                if (y >= 0 && y < height) {
                    sum += temp[y * width + x];
                    count += 1;
                }
            }
            for (let y = 0; y < height; y += 1) {
                output[y * width + x] = sum / count;
                const top = y - radius;
                const bottom = y + radius + 1;
                if (top >= 0) {
                    sum -= temp[top * width + x];
                    count -= 1;
                }
                if (bottom < height) {
                    sum += temp[bottom * width + x];
                    count += 1;
                }
            }
        }

        return output;
    };

    const dilateMask = (mask, width, height, radius) => {
        if (radius <= 0) return mask.slice();
        const temp = new Uint8Array(mask.length);
        const output = new Uint8Array(mask.length);

        for (let y = 0; y < height; y += 1) {
            let count = 0;
            const row = y * width;
            for (let x = -radius; x <= radius; x += 1) {
                if (x >= 0 && x < width) count += mask[row + x];
            }
            for (let x = 0; x < width; x += 1) {
                temp[row + x] = count > 0 ? 1 : 0;
                const left = x - radius;
                const right = x + radius + 1;
                if (left >= 0) count -= mask[row + left];
                if (right < width) count += mask[row + right];
            }
        }

        for (let x = 0; x < width; x += 1) {
            let count = 0;
            for (let y = -radius; y <= radius; y += 1) {
                if (y >= 0 && y < height) count += temp[y * width + x];
            }
            for (let y = 0; y < height; y += 1) {
                output[y * width + x] = count > 0 ? 1 : 0;
                const top = y - radius;
                const bottom = y + radius + 1;
                if (top >= 0) count -= temp[top * width + x];
                if (bottom < height) count += temp[bottom * width + x];
            }
        }

        return output;
    };

    const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));

    const mixValue = (from, to, amount) => from + (to - from) * amount;

    const getRemovalProfile = (strength) => {
        const profiles = {
            1: {
                brightDiff: 25,
                edgeMin: 40,
                edgeMax: 270,
                lumaMax: 218,
                saturationMax: 42,
                componentScale: 0.72,
                lineSelectivity: 0.74,
                expansionRadius: 1,
                targetCoverage: 0.012,
                repairAmount: 0.62,
                shadowDiff: -18
            },
            2: {
                brightDiff: 22,
                edgeMin: 36,
                edgeMax: 292,
                lumaMax: 224,
                saturationMax: 48,
                componentScale: 0.84,
                lineSelectivity: 0.66,
                expansionRadius: 1,
                targetCoverage: 0.015,
                repairAmount: 0.7,
                shadowDiff: -16
            },
            3: {
                brightDiff: 19,
                edgeMin: 32,
                edgeMax: 314,
                lumaMax: 229,
                saturationMax: 54,
                componentScale: 1,
                lineSelectivity: 0.58,
                expansionRadius: 2,
                targetCoverage: 0.018,
                repairAmount: 0.78,
                shadowDiff: -14
            },
            4: {
                brightDiff: 17,
                edgeMin: 29,
                edgeMax: 336,
                lumaMax: 234,
                saturationMax: 61,
                componentScale: 1.15,
                lineSelectivity: 0.52,
                expansionRadius: 2,
                targetCoverage: 0.021,
                repairAmount: 0.85,
                shadowDiff: -12
            },
            5: {
                brightDiff: 15,
                edgeMin: 26,
                edgeMax: 360,
                lumaMax: 238,
                saturationMax: 68,
                componentScale: 1.3,
                lineSelectivity: 0.48,
                expansionRadius: 2,
                targetCoverage: 0.024,
                repairAmount: 0.9,
                shadowDiff: -10
            }
        };

        return profiles[strength] || profiles[3];
    };

    const filterMaskComponents = (mask, confidence, width, height, strength, profile) => {
        const visited = new Uint8Array(mask.length);
        const output = new Uint8Array(mask.length);
        const components = [];
        const stack = [];
        const total = width * height;
        const minArea = Math.max(4, Math.round(total * 0.0000015));
        const maxArea = Math.max(60, Math.round(total * (0.00014 + strength * 0.000045) * profile.componentScale));
        const maxBoxWidth = Math.max(18, Math.round(width * 0.22));
        const maxBoxHeight = Math.max(12, Math.round(height * 0.095));

        for (let start = 0; start < mask.length; start += 1) {
            if (!mask[start] || visited[start]) continue;

            stack.length = 0;
            stack.push(start);
            visited[start] = 1;
            const pixels = [];
            let minX = width;
            let minY = height;
            let maxX = 0;
            let maxY = 0;
            let scoreSum = 0;

            while (stack.length) {
                const index = stack.pop();
                pixels.push(index);
                scoreSum += confidence[index] || 0;
                const x = index % width;
                const y = Math.floor(index / width);
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                const neighbors = [index - 1, index + 1, index - width, index + width];
                for (const next of neighbors) {
                    if (next < 0 || next >= mask.length || visited[next] || !mask[next]) continue;
                    const nx = next % width;
                    if (Math.abs(nx - x) > 1) continue;
                    visited[next] = 1;
                    stack.push(next);
                }
            }

            const area = pixels.length;
            const boxWidth = maxX - minX + 1;
            const boxHeight = maxY - minY + 1;
            const boxArea = boxWidth * boxHeight;
            const density = area / Math.max(1, boxArea);
            const minDimension = Math.min(boxWidth, boxHeight);
            const maxDimension = Math.max(boxWidth, boxHeight);
            const meanScore = scoreSum / Math.max(1, area);
            const usableArea = area >= minArea && area <= maxArea;
            const usableShape =
                boxWidth >= 3 &&
                boxHeight >= 3 &&
                boxWidth <= maxBoxWidth &&
                boxHeight <= maxBoxHeight &&
                minDimension <= Math.max(30, Math.round(Math.min(width, height) * 0.055)) &&
                maxDimension / Math.max(1, minDimension) <= 18 &&
                density >= 0.025 &&
                density <= 0.58 &&
                meanScore >= 0.13;

            if (usableArea && usableShape) {
                for (const index of pixels) output[index] = 1;
                components.push({
                    pixels,
                    minX,
                    minY,
                    maxX,
                    maxY,
                    area,
                    score: scoreSum,
                    meanScore,
                    centerX: (minX + maxX) / 2,
                    centerY: (minY + maxY) / 2,
                    boxWidth,
                    boxHeight
                });
            }
        }

        return { mask: output, components };
    };

    const selectTextLikeComponentMask = (componentResult, width, height, strength, profile) => {
        const { mask, components } = componentResult;
        if (components.length < 2) {
            return mask;
        }

        const tolerance = Math.max(8, Math.round(height * (0.018 + strength * 0.004)));
        const groups = [];

        for (const anchor of components) {
            const members = components.filter(component => {
                const overlapsY = component.minY <= anchor.maxY + tolerance && component.maxY >= anchor.minY - tolerance;
                const closeCenter = Math.abs(component.centerY - anchor.centerY) <= tolerance;
                return overlapsY || closeCenter;
            });

            if (!members.length) continue;

            const minX = Math.min(...members.map(component => component.minX));
            const maxX = Math.max(...members.map(component => component.maxX));
            const minY = Math.min(...members.map(component => component.minY));
            const maxY = Math.max(...members.map(component => component.maxY));
            const area = members.reduce((sum, component) => sum + component.area, 0);
            const score = members.reduce((sum, component) => sum + component.score, 0);
            const spanX = maxX - minX + 1;
            const spanY = maxY - minY + 1;
            const spanRatio = spanX / width;
            const heightRatio = spanY / height;
            const coverage = area / (width * height);
            const broadPenalty = spanRatio > 0.55 ? (spanRatio - 0.55) * 26 : 0;
            const heightPenalty = heightRatio > 0.1 ? (heightRatio - 0.1) * 85 : 0;
            const clusterScore =
                members.length * 3 +
                spanRatio * 34 +
                Math.min(18, coverage * 2400) +
                (score / Math.max(1, area)) * 18 -
                broadPenalty -
                heightPenalty;

            if (
                members.length >= 2 &&
                spanX >= Math.max(22, width * 0.035) &&
                spanY <= Math.max(18, height * (0.078 + strength * 0.008)) &&
                coverage <= profile.targetCoverage * 1.9
            ) {
                groups.push({ members, score: clusterScore });
            }
        }

        if (!groups.length) {
            return mask;
        }

        groups.sort((a, b) => b.score - a.score);
        const bestScore = groups[0].score;
        const selectedComponents = new Set();
        const selectedGroups = [];
        const maxGroups = strength >= 4 ? 3 : 2;

        for (const group of groups) {
            if (group.score < bestScore * profile.lineSelectivity || selectedGroups.length >= maxGroups) continue;

            const existingOverlap = selectedGroups.some(selected => {
                const groupMembers = new Set(group.members);
                let overlap = 0;
                for (const component of selected.members) {
                    if (groupMembers.has(component)) overlap += 1;
                }
                return overlap / Math.max(1, Math.min(selected.members.length, group.members.length)) > 0.65;
            });

            if (!existingOverlap) {
                selectedGroups.push(group);
                group.members.forEach(component => selectedComponents.add(component));
            }
        }

        if (!selectedComponents.size) {
            return mask;
        }

        const output = new Uint8Array(mask.length);
        selectedComponents.forEach(component => {
            for (const index of component.pixels) output[index] = 1;
        });
        return output;
    };

    const expandMaskWithConfidence = (mask, confidence, width, height, radius) => {
        if (radius <= 0) {
            return {
                mask: mask.slice(),
                confidence: new Float32Array(confidence)
            };
        }

        const output = mask.slice();
        const outputConfidence = new Float32Array(confidence);

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const index = y * width + x;
                if (!mask[index]) continue;

                const baseConfidence = confidence[index] || 0.55;
                for (let yy = Math.max(0, y - radius); yy <= Math.min(height - 1, y + radius); yy += 1) {
                    for (let xx = Math.max(0, x - radius); xx <= Math.min(width - 1, x + radius); xx += 1) {
                        const distance = Math.hypot(xx - x, yy - y);
                        if (distance > radius) continue;
                        const nextIndex = yy * width + xx;
                        const spread = baseConfidence * (0.72 - (distance / Math.max(1, radius + 1)) * 0.36);
                        if (spread > outputConfidence[nextIndex]) {
                            outputConfidence[nextIndex] = spread;
                            output[nextIndex] = 1;
                        }
                    }
                }
            }
        }

        return { mask: output, confidence: outputConfidence };
    };

    const addAdjacentShadowMask = (mask, confidence, luma, saturation, local, width, height, profile) => {
        const nearMask = dilateMask(mask, width, height, 1);
        const output = mask.slice();
        const outputConfidence = new Float32Array(confidence);

        for (let i = 0; i < output.length; i += 1) {
            if (!nearMask[i] || output[i]) continue;
            const signedDiff = luma[i] - local[i];
            if (
                signedDiff <= profile.shadowDiff &&
                signedDiff >= -62 &&
                saturation[i] <= profile.saturationMax + 14 &&
                luma[i] > 18 &&
                luma[i] < 205
            ) {
                output[i] = 1;
                outputConfidence[i] = Math.max(outputConfidence[i], 0.38);
            }
        }

        return { mask: output, confidence: outputConfidence };
    };

    const trimMaskToConfidence = (mask, confidence, targetCoverage) => {
        const total = mask.length;
        const targetCount = Math.max(1, Math.round(total * targetCoverage));
        let count = 0;
        for (let i = 0; i < total; i += 1) {
            if (mask[i]) count += 1;
        }

        if (count <= targetCount) {
            return { mask, confidence, coverage: count / total, trimmed: false };
        }

        const scoredPixels = [];
        for (let i = 0; i < total; i += 1) {
            if (mask[i]) {
                scoredPixels.push({
                    index: i,
                    score: confidence[i] || 0
                });
            }
        }
        scoredPixels.sort((a, b) => b.score - a.score);
        const output = new Uint8Array(total);
        const outputConfidence = new Float32Array(total);

        const kept = Math.min(targetCount, scoredPixels.length);
        for (let i = 0; i < kept; i += 1) {
            const { index, score } = scoredPixels[i];
            output[index] = 1;
            outputConfidence[index] = score;
        }

        return {
            mask: output,
            confidence: outputConfidence,
            coverage: kept / total,
            trimmed: true
        };
    };

    const calculateCoverage = (mask) => {
        let count = 0;
        for (let i = 0; i < mask.length; i += 1) {
            if (mask[i]) count += 1;
        }
        return count / mask.length;
    };

    const mergeMaskResults = (results, total) => {
        const mask = new Uint8Array(total);
        const confidence = new Float32Array(total);

        for (const result of results) {
            if (!result?.mask) continue;
            for (let i = 0; i < total; i += 1) {
                if (!result.mask[i]) continue;
                mask[i] = 1;
                confidence[i] = Math.max(confidence[i], result.confidence?.[i] || 0.55);
            }
        }

        return { mask, confidence, coverage: calculateCoverage(mask) };
    };

    const makeTextMaskCandidate = (text, fontSize) => {
        const maskCanvas = document.createElement('canvas');
        const maskCtx = maskCanvas.getContext('2d');
        maskCtx.font = `700 ${fontSize}px Inter, Arial, sans-serif`;
        const metrics = maskCtx.measureText(text);
        const pad = Math.max(8, Math.round(fontSize * 0.42));
        const width = Math.ceil(metrics.width + pad * 2);
        const height = Math.ceil(fontSize + pad * 2);

        maskCanvas.width = width;
        maskCanvas.height = height;
        maskCtx.clearRect(0, 0, width, height);
        maskCtx.font = `700 ${fontSize}px Inter, Arial, sans-serif`;
        maskCtx.textBaseline = 'top';
        maskCtx.fillStyle = '#EDEAE4';
        maskCtx.shadowColor = 'rgba(0, 0, 0, 0.72)';
        maskCtx.shadowBlur = Math.max(2, fontSize * 0.12);
        maskCtx.shadowOffsetX = Math.max(1, fontSize * 0.045);
        maskCtx.shadowOffsetY = Math.max(1, fontSize * 0.045);
        maskCtx.fillText(text, pad, pad);

        return {
            text,
            fontSize,
            width,
            height,
            alpha: maskCtx.getImageData(0, 0, width, height).data
        };
    };

    const getTemplatePositions = (imageWidth, imageHeight, markWidth, markHeight) => {
        const padding = Math.max(12, Math.round(Math.min(imageWidth, imageHeight) * 0.035));
        const centerX = (imageWidth - markWidth) / 2;
        const centerY = (imageHeight - markHeight) / 2;
        const left = padding;
        const right = imageWidth - markWidth - padding;
        const top = padding;
        const bottom = imageHeight - markHeight - padding;

        return [
            [centerX, centerY],
            [right, centerY],
            [left, centerY],
            [centerX, top],
            [centerX, bottom],
            [left, top],
            [right, top],
            [left, bottom],
            [right, bottom],
            [centerX + imageWidth * 0.08, centerY],
            [centerX - imageWidth * 0.08, centerY]
        ].map(([x, y]) => ({
            x: Math.round(clampValue(x, 0, Math.max(0, imageWidth - markWidth))),
            y: Math.round(clampValue(y, 0, Math.max(0, imageHeight - markHeight)))
        }));
    };

    const scoreTextMaskCandidate = (candidate, position, luma, local, saturation, width, height) => {
        let weight = 0;
        let score = 0;
        let brightHits = 0;
        let sampled = 0;

        for (let y = 0; y < candidate.height; y += 1) {
            const imageY = position.y + y;
            if (imageY < 0 || imageY >= height) continue;
            for (let x = 0; x < candidate.width; x += 1) {
                const alpha = candidate.alpha[(y * candidate.width + x) * 4 + 3] / 255;
                if (alpha < 0.08) continue;

                const imageX = position.x + x;
                if (imageX < 0 || imageX >= width) continue;

                const index = imageY * width + imageX;
                const signedDiff = luma[index] - local[index];
                const neutral = clampValue(1 - saturation[index] / 96, 0.18, 1);
                const brightScore = clampValue(signedDiff / 48, 0, 1);
                const shadowScore = clampValue((-signedDiff - 8) / 58, 0, 0.55);
                const pixelScore = Math.max(brightScore, shadowScore * 0.55) * neutral;

                score += pixelScore * alpha;
                weight += alpha;
                sampled += 1;
                if (signedDiff > 13) brightHits += 1;
            }
        }

        const meanScore = weight > 0 ? score / weight : 0;
        const brightRatio = sampled > 0 ? brightHits / sampled : 0;
        return meanScore + Math.min(0.18, brightRatio * 0.42);
    };

    const maskFromTextCandidate = (candidate, position, total, width, height, score) => {
        const mask = new Uint8Array(total);
        const confidence = new Float32Array(total);
        const baseConfidence = clampValue(0.58 + score * 0.72, 0.6, 0.98);

        for (let y = 0; y < candidate.height; y += 1) {
            const imageY = position.y + y;
            if (imageY < 0 || imageY >= height) continue;
            for (let x = 0; x < candidate.width; x += 1) {
                const alpha = candidate.alpha[(y * candidate.width + x) * 4 + 3] / 255;
                if (alpha < 0.055) continue;

                const imageX = position.x + x;
                if (imageX < 0 || imageX >= width) continue;
                const index = imageY * width + imageX;
                mask[index] = 1;
                confidence[index] = Math.max(confidence[index], clampValue(alpha * baseConfidence, 0.38, 1));
            }
        }

        return { mask, confidence, coverage: calculateCoverage(mask), score };
    };

    const detectTemplateWatermarkMask = (imageData) => {
        const { width, height, data } = imageData;
        const total = width * height;
        const luma = new Float32Array(total);
        const saturation = new Float32Array(total);

        for (let i = 0, p = 0; i < total; i += 1, p += 4) {
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];
            luma[i] = getLuma(r, g, b);
            saturation[i] = Math.max(r, g, b) - Math.min(r, g, b);
        }

        const local = boxBlurFloat(luma, width, height, Math.max(11, Math.round(Math.min(width, height) / 36)));
        const texts = ['\u00A9 StegaMark', 'StegaMark'];
        const sizeFactors = [0.045, 0.05, 0.055, 0.06, 0.04];
        let best = null;

        for (const text of texts) {
            for (const factor of sizeFactors) {
                const candidate = makeTextMaskCandidate(text, Math.max(18, Math.round(height * factor)));
                for (const position of getTemplatePositions(width, height, candidate.width, candidate.height)) {
                    const score = scoreTextMaskCandidate(candidate, position, luma, local, saturation, width, height);
                    if (!best || score > best.score) {
                        best = { candidate, position, score };
                    }
                }
            }
        }

        if (!best || best.score < 0.16) {
            return null;
        }

        const template = maskFromTextCandidate(best.candidate, best.position, total, width, height, best.score);
        const expanded = expandMaskWithConfidence(template.mask, template.confidence, width, height, 2);
        return {
            mask: expanded.mask,
            confidence: expanded.confidence,
            coverage: calculateCoverage(expanded.mask),
            score: best.score
        };
    };

    const detectVisibleWatermarkMask = (imageData, strength) => {
        const { width, height, data } = imageData;
        const total = width * height;
        const profile = getRemovalProfile(strength);
        const luma = new Float32Array(total);
        const saturation = new Float32Array(total);
        const confidence = new Float32Array(total);

        for (let i = 0, p = 0; i < total; i += 1, p += 4) {
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            luma[i] = getLuma(r, g, b);
            saturation[i] = max - min;
        }

        const blurRadius = Math.max(9, Math.round(Math.min(width, height) / 42));
        const local = boxBlurFloat(luma, width, height, blurRadius);
        const raw = new Uint8Array(total);

        for (let y = 1; y < height - 1; y += 1) {
            for (let x = 1; x < width - 1; x += 1) {
                const i = y * width + x;
                const gx =
                    -luma[i - width - 1] + luma[i - width + 1] -
                    2 * luma[i - 1] + 2 * luma[i + 1] -
                    luma[i + width - 1] + luma[i + width + 1];
                const gy =
                    -luma[i - width - 1] - 2 * luma[i - width] - luma[i - width + 1] +
                    luma[i + width - 1] + 2 * luma[i + width] + luma[i + width + 1];
                const edge = Math.abs(gx) + Math.abs(gy);
                const signedDiff = luma[i] - local[i];
                const neutralStroke = saturation[i] <= profile.saturationMax;
                const notClipped = luma[i] > 24 && luma[i] < profile.lumaMax;
                const brightOverlay = signedDiff >= profile.brightDiff && signedDiff <= 88 && luma[i] > 74;

                if (edge >= profile.edgeMin && edge <= profile.edgeMax && brightOverlay && neutralStroke && notClipped) {
                    const diffScore = clampValue((signedDiff - profile.brightDiff) / (88 - profile.brightDiff), 0, 1);
                    const edgeScore = clampValue(1 - ((edge - profile.edgeMin) / (profile.edgeMax - profile.edgeMin)) * 0.45, 0.25, 1);
                    const saturationScore = clampValue(1 - saturation[i] / Math.max(1, profile.saturationMax + 1), 0.25, 1);
                    confidence[i] = clampValue(0.18 + diffScore * 0.52 + edgeScore * 0.2 + saturationScore * 0.1, 0, 1);
                    raw[i] = 1;
                }
            }
        }

        const filtered = filterMaskComponents(raw, confidence, width, height, strength, profile);
        const selected = selectTextLikeComponentMask(filtered, width, height, strength, profile);
        const expanded = expandMaskWithConfidence(selected, confidence, width, height, profile.expansionRadius);
        const withShadows = addAdjacentShadowMask(expanded.mask, expanded.confidence, luma, saturation, local, width, height, profile);
        const trimmed = trimMaskToConfidence(withShadows.mask, withShadows.confidence, profile.targetCoverage);

        return {
            mask: trimmed.mask,
            confidence: trimmed.confidence,
            coverage: trimmed.coverage,
            trimmed: trimmed.trimmed,
            profile
        };
    };

    const keepMaskNearAnchor = (result, anchorMask, width, height, radius) => {
        if (!result?.mask || !anchorMask) return result;
        const nearAnchor = dilateMask(anchorMask, width, height, radius);
        const mask = new Uint8Array(result.mask.length);
        const confidence = new Float32Array(result.mask.length);

        for (let i = 0; i < result.mask.length; i += 1) {
            if (result.mask[i] && nearAnchor[i]) {
                mask[i] = 1;
                confidence[i] = result.confidence?.[i] || 0.5;
            }
        }

        return {
            ...result,
            mask,
            confidence,
            coverage: calculateCoverage(mask)
        };
    };

    const detectAutomaticWatermarkMask = (imageData) => {
        const { width, height } = imageData;
        const total = width * height;
        const template = detectTemplateWatermarkMask(imageData);
        const genericStrengths = template ? [4, 5, 3] : [3, 4, 5, 2, 1];
        const genericResults = genericStrengths
            .map(strength => detectVisibleWatermarkMask(imageData, strength))
            .map(result => {
                if (!template) return result;
                const radius = Math.max(20, Math.round(Math.min(width, height) * 0.06));
                return keepMaskNearAnchor(result, template.mask, width, height, radius);
            });

        const merged = mergeMaskResults(template ? [template, ...genericResults] : genericResults, total);
        const targetCoverage = template
            ? clampValue(Math.max(template.coverage * 1.35, 0.012), 0.012, 0.034)
            : 0.021;
        const trimmed = trimMaskToConfidence(merged.mask, merged.confidence, targetCoverage);
        const coverage = calculateCoverage(trimmed.mask);

        return {
            mask: trimmed.mask,
            confidence: trimmed.confidence,
            coverage,
            trimmed: trimmed.trimmed,
            profile: {
                ...getRemovalProfile(template ? 5 : 4),
                repairAmount: template ? 0.96 : 0.9
            },
            templateScore: template?.score || 0
        };
    };

    const cleanImageDataAutomatically = (imageData) => {
        const firstPass = detectAutomaticWatermarkMask(imageData);
        if (firstPass.coverage < 0.00005) {
            return {
                imageData,
                coverage: 0,
                passes: 0,
                trimmed: false
            };
        }

        let outputImageData = inpaintMaskFromNeighbors(imageData, firstPass.mask, firstPass.confidence, 5, firstPass.profile);
        let totalCoverage = firstPass.coverage;
        let trimmed = firstPass.trimmed;
        const residual = detectTemplateWatermarkMask(outputImageData);

        if (residual && residual.coverage >= 0.00005 && residual.score >= 0.13) {
            const profile = {
                ...getRemovalProfile(5),
                repairAmount: 0.94
            };
            outputImageData = inpaintMaskFromNeighbors(outputImageData, residual.mask, residual.confidence, 5, profile);
            totalCoverage += residual.coverage;
        }

        return {
            imageData: outputImageData,
            coverage: totalCoverage,
            passes: residual ? 2 : 1,
            trimmed
        };
    };

    const inpaintMaskFromNeighbors = (imageData, mask, confidence, strength, profile) => {
        const { width, height } = imageData;
        const original = imageData.data;
        const output = new Uint8ClampedArray(original);
        const innerRadius = Math.max(1, Math.round(strength * 0.45));
        const outerRadius = Math.max(5, 6 + strength * 2);

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const index = y * width + x;
                if (!mask[index]) continue;

                let r = 0;
                let g = 0;
                let b = 0;
                let weight = 0;
                const originalOffset = index * 4;
                const originalLuma = getLuma(original[originalOffset], original[originalOffset + 1], original[originalOffset + 2]);

                for (let yy = Math.max(0, y - outerRadius); yy <= Math.min(height - 1, y + outerRadius); yy += 1) {
                    for (let xx = Math.max(0, x - outerRadius); xx <= Math.min(width - 1, x + outerRadius); xx += 1) {
                        const dx = xx - x;
                        const dy = yy - y;
                        const distance = Math.hypot(dx, dy);
                        if (distance <= innerRadius || distance > outerRadius) continue;
                        const ni = yy * width + xx;
                        if (mask[ni]) continue;

                        const p = ni * 4;
                        const sampleLuma = getLuma(original[p], original[p + 1], original[p + 2]);
                        const lumaWeight = 1 / (1 + Math.abs(sampleLuma - originalLuma) / 28);
                        const distanceWeight = 1 / distance;
                        const w = lumaWeight * distanceWeight;
                        r += original[p] * w;
                        g += original[p + 1] * w;
                        b += original[p + 2] * w;
                        weight += w;
                    }
                }

                if (weight > 0) {
                    const bgR = r / weight;
                    const bgG = g / weight;
                    const bgB = b / weight;
                    const bgLuma = getLuma(bgR, bgG, bgB);
                    const signedDiff = originalLuma - bgLuma;
                    let targetR = bgR;
                    let targetG = bgG;
                    let targetB = bgB;

                    if (signedDiff > 0) {
                        const alpha = clampValue(signedDiff / Math.max(24, 255 - bgLuma), 0.06, 0.72);
                        const deblendR = clampValue((original[originalOffset] - alpha * 255) / (1 - alpha), 0, 255);
                        const deblendG = clampValue((original[originalOffset + 1] - alpha * 255) / (1 - alpha), 0, 255);
                        const deblendB = clampValue((original[originalOffset + 2] - alpha * 255) / (1 - alpha), 0, 255);
                        targetR = mixValue(deblendR, bgR, 0.42);
                        targetG = mixValue(deblendG, bgG, 0.42);
                        targetB = mixValue(deblendB, bgB, 0.42);
                    }

                    const pixelConfidence = clampValue(confidence[index] || 0.45, 0.18, 1);
                    const amount = clampValue(profile.repairAmount * (0.55 + pixelConfidence * 0.55), 0.28, 0.96);
                    output[originalOffset] = mixValue(original[originalOffset], targetR, amount);
                    output[originalOffset + 1] = mixValue(original[originalOffset + 1], targetG, amount);
                    output[originalOffset + 2] = mixValue(original[originalOffset + 2], targetB, amount);
                }
            }
        }

        return new ImageData(output, width, height);
    };

    const applyRemoval = async () => {
        if (isProcessingRemove || !removeImageFile || !removeImageDataUrl) return;

        isProcessingRemove = true;
        setButtonLoading(removeWatermarkBtn, true);
        removeDownloadBtn.disabled = true;
        removeComparison.classList.add('hidden');
        setStatus(removeStatus, 'Removing watermark...', 'processing', 0);

        try {
            const image = await loadImageFromUrl(removeImageDataUrl);
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth || image.width;
            canvas.height = image.naturalHeight || image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const result = cleanImageDataAutomatically(imageData);
            const hasUsableMask = result.coverage >= 0.00005;

            if (!hasUsableMask) {
                removePreviewImage.src = removeImageDataUrl;
                removePreviewImage.classList.remove('hidden');
                removeComparison.classList.add('hidden');
                removeDownloadBtn.disabled = true;
                setStatus(removeStatus, 'No confident visible watermark strokes found.', 'error');
                return;
            }

            ctx.putImageData(result.imageData, 0, 0);

            const outputType = removeImageFile.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
            const blob = await canvasToBlob(canvas, outputType, outputType === 'image/jpeg' ? 0.94 : undefined);
            if (removedBlobUrl) URL.revokeObjectURL(removedBlobUrl);
            removedBlobUrl = URL.createObjectURL(blob);
            const baseName = removeImageFile.name.replace(/\.[^/.]+$/, '') || 'image';
            const extension = outputType === 'image/jpeg' ? 'jpg' : 'png';
            removeDownloadFilename = `${baseName}_cleaned.${extension}`;
            removePreviewImage.src = removedBlobUrl;
            removePreviewImage.classList.add('hidden');
            removeBeforeImage.src = removeImageDataUrl;
            removeAfterImage.src = removedBlobUrl;
            removeComparison.classList.remove('hidden');
            removeComparison.style.setProperty('--compare-position', '50%');
            noRemoveImageMessage.classList.add('hidden');
            removeDownloadBtn.disabled = false;
            const percent = (result.coverage * 100).toFixed(2);
            setStatus(removeStatus, `Watermark removed automatically (${percent}% repaired).`, 'success');
        } catch (error) {
            console.error('Remove Watermark Error:', error);
            setStatus(removeStatus, error.message, 'error');
        } finally {
            isProcessingRemove = false;
            setButtonLoading(removeWatermarkBtn, false);
        }
    };

    removeImageUpload.addEventListener('change', (event) => {
        loadRemoveImageFile(event.target.files?.[0] || null);
    });

    bindDropzone(removePreviewContainer, loadRemoveImageFile);

    removeWatermarkBtn.addEventListener('click', applyRemoval);
    removeResetBtn.addEventListener('click', resetRemoveArea);
    removePreviewContainer.addEventListener('click', (event) => {
        if (event.target.closest('.comparison-view')) return;
        if (!isProcessingRemove) removeImageUpload.click();
    });
    removeComparison.addEventListener('pointerdown', startCompareDrag);
    removeComparison.addEventListener('pointermove', moveCompareDrag);
    removeComparison.addEventListener('pointerup', (event) => {
        removeComparison.releasePointerCapture?.(event.pointerId);
    });
    removeComparison.addEventListener('pointercancel', (event) => {
        removeComparison.releasePointerCapture?.(event.pointerId);
    });

    removeDownloadBtn.addEventListener('click', () => {
        if (!removedBlobUrl) return;
        const link = document.createElement('a');
        link.download = removeDownloadFilename;
        link.href = removedBlobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setStatus(removeStatus, 'Download started.', 'info', 1500);
    });

    // --- Initialize ---
    resetAll(); // Set initial state on load
    updateWatermarkTypeUI(); // Ensure correct UI visibility

}); // End DOMContentLoaded
