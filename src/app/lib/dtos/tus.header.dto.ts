import {z} from 'zod';

export const TusCreateHeadersSchema = z.object({
  'tus-resumable': z.string().refine(val => val === '1.0.0', {
    message: 'TUS version must be 1.0.0'
  }),
  'upload-length': z.string().transform(val => {
    const num = parseInt(val)
    if (isNaN(num) || num <= 0) {
      throw new Error('upload-length must be a positive number')
    }
    if (num > 20 * 1024 * 1024) { // 20MB limit
      throw new Error('File size exceeds 20MB limit')
    }
    return num
  }),
  'upload-metadata': z.string().optional(),
  'content-length': z.string().transform(val => {
    const num = parseInt(val)
    if (isNaN(num) || num < 0) {
      throw new Error('content-length must be a positive number')
    }
    return num
  })
})
export const TusUploadHeadersSchema = z.object({
  'tus-resumable': z.string().refine(val => val === '1.0.0', {
    message: 'TUS version must be 1.0.0'
  }),
  'upload-offset': z.string().transform(val => {
    const num = parseInt(val)
    if (isNaN(num) || num < 0) {
      throw new Error('upload-offset must be a non-negative number')
    }
    return num
  }),
  'content-type': z.string().refine(val => val === 'application/offset+octet-stream', {
    message: 'Content-Type must be application/offset+octet-stream for TUS chunk uploads'
  }),
  'content-length': z.string().transform(val => {
    const num = parseInt(val)
    if (isNaN(num) || num <= 0) {
      throw new Error('content-length must be a positive number')
    }
    if (num > 5 * 1024 * 1024) { // 5MB chunk limit
      throw new Error('Chunk size exceeds 5MB limit')
    }
    return num
  })
})

export const TusDeleteHeadersSchema = z.object({
  'tus-resumable': z.string().refine(val => val === '1.0.0', {
    message: 'TUS version must be 1.0.0'
  })
})

export const TusStatusHeadersSchema = z.object({
  'tus-resumable': z.string().refine(val => val === '1.0.0', {
    message: 'TUS version must be 1.0.0'
  })
})

export type TusCreateHeaders = z.infer<typeof TusCreateHeadersSchema>;
export type TusUploadHeaders = z.infer<typeof TusUploadHeadersSchema>;
export type TusDeleteHeaders = z.infer<typeof TusDeleteHeadersSchema>;
export type TusStatusHeaders = z.infer<typeof TusStatusHeadersSchema>;
