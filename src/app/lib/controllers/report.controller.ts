'use server'
import { reportRequestSchema } from '@/dtos/report.dto';


export async function reportCreation(title: string, description: string, category: string, photos: string[], longitude: number, latitude: number, userId: string) {
    
    const reportData = reportRequestSchema.parse({
        title,
        description,
        photos,
        longitude,
        latitude,
        userId
    });

    


    



}