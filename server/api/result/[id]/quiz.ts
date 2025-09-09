// server/api/result/[id]/quiz.ts
import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
    try {
        // Only allow GET requests
        if (getMethod(event) !== 'GET') {
            throw createError({
                statusCode: 405,
                statusMessage: 'Method not allowed'
            })
        }

        // Get the ID from the route parameter
        const id = getRouterParam(event, 'id')

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID parameter is required'
            })
        }

        // Validate ID format (UUID or alphanumeric)
        if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid ID format'
            })
        }

        // Construct the path to the quiz.json file
        const quizFilePath = path.join(process.cwd(), 'public', 'data', 'uploads', id, 'quiz.json')

        // Check if the quiz file exists
        try {
            await fs.access(quizFilePath)
        } catch {
            throw createError({
                statusCode: 404,
                statusMessage: `Quiz file not found for ID: ${id}`
            })
        }

        // Read and parse the quiz JSON file
        try {
            const quizContent = await fs.readFile(quizFilePath, 'utf-8')
            const quizData = JSON.parse(quizContent)

            // Validate that it has the expected structure
            if (!quizData.quiz || !Array.isArray(quizData.quiz)) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Invalid quiz file format'
                })
            }

            // Set appropriate headers for JSON response
            setHeader(event, 'Content-Type', 'application/json')

            return quizData
        } catch (parseError: any) {
            if (parseError.statusCode) {
                throw parseError
            }

            console.error('Quiz file parsing error:', parseError)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to parse quiz file'
            })
        }

    } catch (error: any) {
        console.error('Quiz endpoint error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        })
    }
})
