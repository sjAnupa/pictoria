import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../config/r2'

/** Upload to Cloudflare R2. Returns the public CDN URL. */
export async function uploadImageToR2(
  file: Express.Multer.File,
  folder: string,
  filename: string,
): Promise<string> {
  const webpBuffer = await sharp(file.buffer).webp({ quality: 85 }).toBuffer()
  const key = `${folder}/${filename}.webp`

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
    }),
  )

  return `${R2_PUBLIC_URL}/${key}`
}

export async function uploadBufferToR2(
  buffer: Buffer,
  folder: string,
  filename: string,
  extension = 'webp',
): Promise<string> {
  const key = `${folder}/${filename}.${extension}`
  const body = extension === 'webp' ? await sharp(buffer).webp({ quality: 85 }).toBuffer() : buffer

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: extension === 'webp' ? 'image/webp' : 'image/png',
    }),
  )

  return `${R2_PUBLIC_URL}/${key}`
}

export async function deleteImageFromR2(imageUrl: string): Promise<void> {
  const prefix = `${R2_PUBLIC_URL}/`
  if (!imageUrl.startsWith(prefix)) return

  const key = imageUrl.slice(prefix.length)
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    }),
  )
}

export function isR2MediaUrl(imageUrl: string): boolean {
  return imageUrl.startsWith(`${R2_PUBLIC_URL}/`)
}
