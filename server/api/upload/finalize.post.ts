import { promises as fs } from 'fs'
import path from 'path'
import { uploadSessions } from '../../utils/uploadSessions.js'

export default defineEventHandler(async (event) => {
    try {
        if (getMethod(event) !== 'POST') {
            throw createError({
                statusCode: 405,
                statusMessage: 'Method not allowed'
            })
        }

        const body = await readBody(event)
        const { uploadId, uuid } = body

        if (!uploadId || !uuid) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing uploadId or uuid'
            })
        }

        // Get upload session
        const session = uploadSessions.get(uploadId)
        if (!session) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Upload session not found'
            })
        }

        // Verify all chunks are uploaded
        if (session.uploadedChunks.size !== session.totalChunks) {
            throw createError({
                statusCode: 400,
                statusMessage: `Missing chunks. Expected ${session.totalChunks}, got ${session.uploadedChunks.size}`
            })
        }

        // Combine chunks into final file
        const finalFilePath = path.join(session.uploadDir, 'video.mp4')
        const writeStream = await fs.open(finalFilePath, 'w')

        try {
            for (let i = 0; i < session.totalChunks; i++) {
                const chunkPath = path.join(session.tempDir, `chunk_${i}`)
                const chunkData = await fs.readFile(chunkPath)
                await writeStream.write(chunkData)
            }
        } finally {
            await writeStream.close()
        }

        // Clean up temporary chunks
        for (let i = 0; i < session.totalChunks; i++) {
            const chunkPath = path.join(session.tempDir, `chunk_${i}`)
            try {
                await fs.unlink(chunkPath)
            } catch (err) {
                console.warn(`Failed to delete chunk ${i}:`, err)
            }
        }

        // Remove temp directory
        try {
            await fs.rmdir(session.tempDir)
        } catch (err) {
            console.warn('Failed to remove temp directory:', err)
        }

        // Clean up session
        uploadSessions.delete(uploadId)

        console.log(`Finalized upload for session: ${uploadId}`)

        return {
            success: true,
            uuid: session.uuid,
            message: 'Video uploaded successfully',
            path: `/data/uploads/${session.uuid}/video.mp4`,
            fileName: session.fileName,
            fileSize: session.fileSize
        }

    } catch (error) {
        console.error('Upload finalize error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error during upload finalization'
        })
    }
})
