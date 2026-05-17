import { generateUploadUrl, uploadFileWithXHR, generateDownloadUrl } from './client';

export interface UploadProgressCallback {
	(progress: number): void;
}

export async function uploadFile(
	file: File,
	onProgress?: UploadProgressCallback
): Promise<{ filename: string; key: string }> {
	const { filename, uploadUrl } = await generateUploadUrl(file.name);
	await uploadFileWithXHR({ file, onProgress }, uploadUrl);
	return { filename, key: filename };
}

export async function downloadFile(key: string): Promise<string> {
	const { downloadUrl } = await generateDownloadUrl(key);
	return downloadUrl;
}
