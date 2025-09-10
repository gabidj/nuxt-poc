import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { uploadSessions } from '../../utils/uploadSessions.js'

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 // 5GB in bytes
const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/x-ms-wmv',  // .wmv
    'video/webm'
]

export default defineEventHandler(async (event) => {
    try {
        if (getMethod(event) !== 'POST') {
            throw createError({
                statusCode: 405,
                statusMessage: 'Method not allowed'
            })
        }

        const body = await readBody(event)
        const { fileName, fileSize, fileType, totalChunks } = body

        // Validate input
        if (!fileName || !fileSize || !fileType || !totalChunks) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields'
            })
        }

        // Check file size
        if (fileSize > MAX_FILE_SIZE) {
            throw createError({
                statusCode: 413,
                statusMessage: 'File too large. Maximum size is 5GB'
            })
        }

        // Check file type
        if (!ALLOWED_VIDEO_TYPES.includes(fileType)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Only video files are allowed'
            })
        }

        // Generate IDs
        const uploadId = randomUUID()
        const uuid = randomUUID()

        // Create upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'data', 'uploads', uuid)
        const tempDir = path.join(uploadDir, 'chunks')

        await fs.mkdir(tempDir, { recursive: true })

        // Store upload session
        uploadSessions.set(uploadId, {
            uuid,
            fileName,
            fileSize,
            fileType,
            totalChunks,
            uploadedChunks: new Set(),
            uploadDir,
            tempDir,
            createdAt: new Date()
        })

        console.log(`Created upload session: ${uploadId}, total sessions: ${uploadSessions.size}`)

        return {
            success: true,
            uploadId,
            uuid,
            message: 'Upload session initialized'
        }

    } catch (error) {
        console.error('Upload init error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error during upload initialization'
        })
    }
})
