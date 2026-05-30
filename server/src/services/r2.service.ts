import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../config/r2'
import { isR2Configured } from '../config/env'

export async function uploadImageToR2(
  file: Express.Multer.File,
  folder: string,
  filename: string,
): Promise<string> {
  if (!isR2Configured()) {
    console.warn('[R2] Upload skipped — Cloudflare R2 credentials are placeholders.')
    return `${R2_PUBLIC_URL}/${folder}/${filename}.webp`
  }

  try {
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
  } catch (error) {
    console.warn('[R2] Upload failed:', error)
    return `${R2_PUBLIC_URL}/${folder}/${filename}.webp`
  }
}

export async function deleteImageFromR2(imageUrl: string): Promise<void> {
  if (!isR2Configured()) {
    console.warn('[R2] Delete skipped — Cloudflare R2 credentials are placeholders.')
    return
  }

  try {
    const prefix = `${R2_PUBLIC_URL}/`
    if (!imageUrl.startsWith(prefix)) return

    const key = imageUrl.slice(prefix.length)

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      }),
    )
  } catch (error) {
    console.warn('[R2] Delete failed:', error)
  }
}
