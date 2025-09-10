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

        const form = await readMultipartFormData(event)

        if (!form || form.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No data uploaded'
            })
        }

        // Extract form data
        const chunkData = form.find(item => item.name === 'chunk')
        const uploadIdField = form.find(item => item.name === 'uploadId')
        const chunkIndexField = form.find(item => item.name === 'chunkIndex')
        const totalChunksField = form.find(item => item.name === 'totalChunks')

        if (!chunkData || !uploadIdField || !chunkIndexField || !totalChunksField) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required chunk data'
            })
        }

        const uploadId = uploadIdField.data.toString()
        const chunkIndex = parseInt(chunkIndexField.data.toString())
        const totalChunks = parseInt(totalChunksField.data.toString())

        console.log(`Looking for upload session: ${uploadId}, available sessions: ${Array.from(uploadSessions.keys())}`)

        // Get upload session
        const session = uploadSessions.get(uploadId)
        if (!session) {
            throw createError({
                statusCode: 404,
                statusMessage: `Upload session not found: ${uploadId}`
            })
        }

        // Validate chunk index
        if (chunkIndex < 0 || chunkIndex >= totalChunks) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid chunk index'
            })
        }

        // Save chunk to temporary file
        const chunkPath = path.join(session.tempDir, `chunk_${chunkIndex}`)
        await fs.writeFile(chunkPath, chunkData.data)

        // Mark chunk as uploaded
        session.uploadedChunks.add(chunkIndex)

        console.log(`Chunk ${chunkIndex} uploaded for session ${uploadId}`)

        return {
            success: true,
            chunkIndex,
            uploadedChunks: session.uploadedChunks.size,
            totalChunks: session.totalChunks,
            message: `Chunk ${chunkIndex} uploaded successfully`
        }

    } catch (error) {
        console.error('Chunk upload error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error during chunk upload'
        })
    }
})
