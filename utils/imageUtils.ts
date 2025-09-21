export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
};

export const base64EncodeString = (dataUrl: string): string => {
    const base64Marker = ';base64,';
    const base64Index = dataUrl.indexOf(base64Marker);
    if (base64Index === -1) {
        // Not a data URL with base64, return as is or handle error
        return dataUrl;
    }
    return dataUrl.substring(base64Index + base64Marker.length);
};

export const getMimeTypeFromDataUrl = (dataUrl: string): string => {
    const match = dataUrl.match(/^data:(.*?);base64,/);
    return match ? match[1] : 'application/octet-stream';
}
