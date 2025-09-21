
import { GoogleGenAI, Modality, Part } from "@google/genai";
import { ImageFile, EditTarget, StylePreset } from "../types";
import { base64EncodeString, getMimeTypeFromDataUrl } from "../utils/imageUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStylePresetKeywords = (preset: StylePreset): string => {
    switch(preset) {
        case StylePreset.PHOTOREALISTIC: return ", photorealistic, 8k, ultra-detailed, sharp focus, professional photography, high definition";
        case StylePreset.CINEMATIC: return ", cinematic lighting, dramatic, epic, wide-angle lens, high contrast, film grain, professional color grading, moody";
        case StylePreset.ANIME: return ", anime style, manga, Japanese animation, cel-shaded, vibrant colors, detailed line art";
        case StylePreset.GHIBLI: return ", Ghibli Studio style, Hayao Miyazaki, painterly backgrounds, nostalgic, whimsical, hand-drawn animation, soft colors, beautiful scenery, enchanting";
        case StylePreset.FANTASY: return ", fantasy art, epic, magical, mythical, detailed illustration, digital painting, high fantasy";
        case StylePreset.WATERCOLOR: return ", watercolor painting, wet-on-wet, soft edges, vibrant washes, paper texture";
        case StylePreset.OIL_PAINTING: return ", oil painting, impasto, visible brushstrokes, rich colors, classic art style";
        case StylePreset.STEAMPUNK: return ", steampunk, Victorian era, gears, cogs, steam-powered machinery, brass and copper details";
        case StylePreset.CYBERPUNK: return ", cyberpunk, neon lights, futuristic city, dystopian, high-tech, Blade Runner style";
        case StylePreset.VAPORWAVE: return ", vaporwave aesthetic, 1980s, 1990s, retro, neon grid, pastel colors, glitch art, roman statues";
        case StylePreset.LOW_POLY: return ", low poly, 3D render, geometric, faceted, minimalist, stylized";
        case StylePreset.PIXEL_ART: return ", pixel art, 16-bit, 8-bit, retro video game, sprites";
        case StylePreset.LINE_ART: return ", line art, black and white, clean lines, minimalist, vector illustration, ink drawing";
        case StylePreset.POP_ART: return ", pop art, Andy Warhol style, bold colors, halftone dots, graphic novel style, comic book";
        case StylePreset.ART_DECO: return ", Art Deco, 1920s style, geometric patterns, sleek, glamorous, bold lines, metallic colors";
        case StylePreset.MINIMALIST: return ", minimalist, clean, simple, negative space, limited color palette";
        case StylePreset.IMPRESSIONISM: return ", impressionist painting, Monet style, visible brushstrokes, focus on light and color, soft focus";
        case StylePreset.SURREALISM: return ", surrealist, dreamlike, strange, bizarre, Dali style, unexpected juxtapositions";
        case StylePreset.ABSTRACT: return ", abstract art, non-representational, shapes, forms, colors, textures";
        case StylePreset.CONCEPT_ART: return ", concept art, digital painting, pre-production, character design, environment design, detailed illustration";
        case StylePreset.VINTAGE_PHOTO: return ", vintage photograph, sepia tone, black and white, film grain, scratches, old photo effect, 1950s";
        case StylePreset.GOTHIC: return ", gothic art, dark, moody, intricate details, medieval, macabre, mysterious";
        case StylePreset.COMIC_BOOK: return ", comic book style, bold outlines, vibrant colors, action lines, graphic illustration, cel-shaded";
        case StylePreset.ISOMETRIC: return ", isometric, 2.5D, detailed, miniature, diorama, orthographic projection";
        case StylePreset.NONE:
        default: return "";
    }
};

export const generateImageFromScratch = async (prompt: string, referenceImages: ImageFile[], stylePreset: StylePreset, negativePrompt: string): Promise<string> => {
    let fullPrompt = `Generate a new, high-quality image based on the following description: "${prompt}"`;
    
    fullPrompt += getStylePresetKeywords(stylePreset);

    if (referenceImages.length > 0) {
        fullPrompt += ` Use the provided reference images for style, subject, and character consistency.`;
    }
    
    if (negativePrompt.trim()) {
        fullPrompt += `\n\n**CRITICAL INSTRUCTION: DO NOT INCLUDE THE FOLLOWING:** ${negativePrompt}.`;
    }
    
    // NOTE: Imagen model does not support reference images in the same way.
    // This is a placeholder for future multi-modal text-to-image models.
    // For now, it will primarily use the text prompt.
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }
    
    throw new Error('The model did not return a generated image.');
};

export const getSubjectMask = async (imageUrl: string): Promise<string> => {
    const prompt = `Generate a segmentation mask for the main subject of the image. The subject should be white (#FFFFFF) and the background should be black (#000000). Do not include any other colors, text, or elements. The output must be only the mask image.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [
            { inlineData: { data: base64EncodeString(imageUrl), mimeType: getMimeTypeFromDataUrl(imageUrl) } },
            { text: prompt }
        ] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error('Failed to generate a subject mask from the model.');
};


export const generateImage = async (imageUrl: string, referenceImages: ImageFile[], prompt: string, maskUrl: string | null, editTarget: EditTarget, stylePreset: StylePreset, negativePrompt: string): Promise<string> => {
    
    let fullPrompt = `You are an expert image editor. Your task is to modify the primary input image based on the user's request. User request: "${prompt}".`;

    fullPrompt += getStylePresetKeywords(stylePreset);
    
    if (negativePrompt.trim()) {
        fullPrompt += `\n\n**CRITICAL INSTRUCTION: DO NOT INCLUDE THE FOLLOWING:** ${negativePrompt}.`;
    }

    const imageParts: Part[] = [
        { inlineData: { data: base64EncodeString(imageUrl), mimeType: getMimeTypeFromDataUrl(imageUrl) } }
    ];

    if (maskUrl) {
        fullPrompt += ` You have been provided a mask. You must apply the changes **ONLY** to the ${editTarget === EditTarget.SUBJECT ? 'white area (the subject)' : 'black area (the background)'} of the mask. Do not alter the other area.`;
        imageParts.push({ inlineData: { data: base64EncodeString(maskUrl), mimeType: getMimeTypeFromDataUrl(maskUrl) } });
    }
    
    if (referenceImages.length > 0) {
        fullPrompt += ` Use the subsequent images for style, subject, and character consistency reference.`;
        imageParts.push(...referenceImages.map(img => ({
          inlineData: { data: base64EncodeString(img.url), mimeType: getMimeTypeFromDataUrl(img.url) }
        })));
    }
    
    const textPart: Part = { text: fullPrompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [...imageParts, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    const textResponse = response.text?.trim();
    if (textResponse) {
        throw new Error(`The model returned a text response instead of an image: "${textResponse}"`);
    } else {
        throw new Error('The model did not return an image or text.');
    }
};


export const upscaleImage = async (imageUrl: string, multiplier: number, referenceImages: ImageFile[]): Promise<string> => {
    
    let fullPrompt = `
You are an expert digital image restoration specialist. Your task is to perform a super-resolution upscale of the provided primary image to ${multiplier}x its original size.

**CRITICAL INSTRUCTIONS:**
1.  **DO NOT SIMPLY RESIZE THE IMAGE.** You must intelligently add new, realistic details and textures where they are missing or indistinct in the original.
2.  **RECONSTRUCT DETAILS:** Reconstruct and sharpen fine details. This includes, but is not limited to, fabric weaves, skin pores, foliage, hair strands, and architectural elements.
3.  **ENHANCE CLARITY:** Enhance the overall clarity and remove any blurriness, noise, or compression artifacts from the original image.
4.  **GOAL:** The final output must be a crisp, clean, high-resolution masterpiece that looks naturally detailed, not artificially sharpened.
`;
    
    if (referenceImages.length > 0) {
        fullPrompt += `\n**REFERENCE IMAGES:** Use the subsequent reference images provided to guide the style, color grading, and texture reconstruction during the upscaling process.`;
    }
    
    const textPart: Part = { text: fullPrompt };
    
    const imageParts: Part[] = [
        { inlineData: { data: base64EncodeString(imageUrl), mimeType: getMimeTypeFromDataUrl(imageUrl) } },
        ...referenceImages.map(img => ({
          inlineData: { data: base64EncodeString(img.url), mimeType: getMimeTypeFromDataUrl(img.url) }
        }))
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [...imageParts, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }

    const textResponse = response.text?.trim();
    if (textResponse) {
        throw new Error(`The model returned a text response instead of an image: "${textResponse}"`);
    } else {
        throw new Error('The model did not return an image or text.');
    }
};

export const animateImage = async (imageUrl: string, prompt: string): Promise<string> => {
    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        image: {
            imageBytes: base64EncodeString(imageUrl),
            mimeType: getMimeTypeFromDataUrl(imageUrl),
        },
        config: {
            numberOfVideos: 1,
        }
    });

    while (!operation.done) {
        await sleep(10000); // Poll every 10 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        return downloadLink;
    }
    
    throw new Error('Video generation finished but no download link was found.');
};