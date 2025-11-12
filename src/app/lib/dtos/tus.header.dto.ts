import {z} from 'zod';


export const TusCreateDataSchema = z.object({
  'tus-resumable': z.string().refine(val => val === '1.0.0', {
    message: 'TUS version must be 1.0.0'
  }),
  'upload-length': z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val) : val
    if (isNaN(num) || num <= 0) {
      throw new Error('upload-length must be a positive number')
    }
    if (num > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('File size exceeds 50MB limit')
    }
    return num
  }),
  'upload-metadata': z.string().optional(),
  'content-length': z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val) : val
    if (isNaN(num) || num < 0) {
      throw new Error('content-length must be a positive number')
    }
    return num
  })
})

export const TusUploadDataSchema = z.object({
  'tus-resumable': z.string().refine(val => val === '1.0.0', {
    message: 'TUS version must be 1.0.0'
  }),
  'upload-offset': z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val) : val
    if (isNaN(num) || num < 0) {
      throw new Error('upload-offset must be a non-negative number')
    }
    return num
  }),
  'content-type': z.string().refine(val => val === 'application/offset+octet-stream', {
    message: 'Content-Type must be application/offset+octet-stream for TUS chunk uploads'
  }),
  'content-length': z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val) : val
    if (isNaN(num) || num <= 0) {
      throw new Error('content-length must be a positive number')
    }
    if (num > 50 * 1024 * 1024) { // 50MB chunk limit
      throw new Error('Chunk size exceeds 50MB limit')
    }
    return num
  })
})

export const TusDeleteDataSchema = z.object({
  'tus-resumable': z.string().refine(val => val === '1.0.0', {
    message: 'TUS version must be 1.0.0'
  })
})

export const TusStatusDataSchema = z.object({
  'tus-resumable': z.string().refine(val => val === '1.0.0', {
    message: 'TUS version must be 1.0.0'
  })
})


export const TusCreateHeadersSchema = TusCreateDataSchema;
export const TusUploadHeadersSchema = TusUploadDataSchema;
export const TusDeleteHeadersSchema = TusDeleteDataSchema;
export const TusStatusHeadersSchema = TusStatusDataSchema;

export type TusCreateData = z.infer<typeof TusCreateDataSchema>;
export type TusUploadData = z.infer<typeof TusUploadDataSchema>;
export type TusDeleteData = z.infer<typeof TusDeleteDataSchema>;
export type TusStatusData = z.infer<typeof TusStatusDataSchema>;


export type TusCreateHeaders = TusCreateData;
export type TusUploadHeaders = TusUploadData;
export type TusDeleteHeaders = TusDeleteData;
export type TusStatusHeaders = TusStatusData;
