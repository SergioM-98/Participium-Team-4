import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

export async function savePhotoFile(body: ArrayBuffer, filePath: string): Promise<number> {
    try {
        const dir = path.dirname(filePath);
        await mkdir(dir, { recursive: true });
        
        const buffer = Buffer.from(body);
        
        await writeFile(filePath, buffer);
        
        // Get the actual file size after saving
        const fileStats = await stat(filePath);
        const savedFileSize = fileStats.size;
        
        console.log(`Photo saved to: ${filePath}, size: ${savedFileSize} bytes`);
        
        return savedFileSize;
    } catch (error) {
        console.error('Error saving photo file:', error);
        throw new Error(`Failed to save photo file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}