import { promises as fs } from 'fs'
import path from 'path'
import OpenAI from "openai";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID parameter is required'
        })
    }

    const publicDir = path.join(process.cwd(), 'public')
    const transcriptPath = path.join(publicDir, 'data', 'uploads', id, 'transcript', 'whisper.json')
    const detailsPath = path.join(publicDir, 'data', 'uploads', id, 'details.json')

    try {
        // Check if whisper.json exists
        await fs.access(transcriptPath)
    } catch (error) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Transcript file not found'
        })
    }

    try {
        // Check if details.json already exists
        const detailsContent = await fs.readFile(detailsPath, 'utf-8')
        return JSON.parse(detailsContent)
    } catch (error) {
        // details.json doesn't exist, proceed with generation
    }


    try {
        // Read the transcript file
        const transcriptContent = await fs.readFile(transcriptPath, 'utf-8')
        const transcript = JSON.parse(transcriptContent)

        // Prepare the prompt for ChatGPT
        const prompt = `Agenda:
Generate an agenda based off this transcript 
Summary - a summary of what the video is about
Short Description - max 3 paragraphs
Long description - max 5 paragraphs
Quiz 3 questions, 4 possible answers, one correct answer.

Transcript: ${JSON.stringify(transcript)}

Only return the exact resulted json and nothing else in this format:
{
    "summary": ".....",
    "shortDescription": [ 
        "paragraph1"
    ],
    "longDescription": [ "paragraph1", "paragraph2", "paragraph3", "paragraph4", "paragraph5"],
    "agenda": {
        "items": [
            { "title": "Introduction and Setup", "startSecond": 0, "duration": 90 }
        ]
    },
    "quiz": [
        {
            "question": "What is the primary reason the presenters emphasize setting up and testing equipment well before a webcast?",
            "options": [
                "To reduce licensing costs for Wirecast",
                "To eliminate last-minute issues and reduce unnecessary stress",
                "To ensure the camera batteries last longer",
                "To automatically upgrade the broadcasting software"
            ],
            "correct_answer_index": 1
        }
    ]
}`


        // Make request to OpenAI API
        const openaiResponse = await openai.responses.create({
            model: 'gpt-5',
            input: prompt,
        })


        const generatedContent = openaiResponse.output_text

        // Parse the JSON response from ChatGPT
        let details
        try {
            details = JSON.parse(generatedContent)
        } catch (parseError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to parse ChatGPT response'
            })
        }

        // Ensure the uploads directory structure exists
        const uploadsDir = path.join(publicDir, 'data', 'uploads', id)
        await fs.mkdir(uploadsDir, { recursive: true })

        // Save the details to file
        await fs.writeFile(detailsPath, JSON.stringify(details, null, 2))

        return details

    } catch (error) {
        console.error('Error processing transcript:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to process transcript'
        })
    }
})
