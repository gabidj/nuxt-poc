import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    try {
        const id = getRouterParam(event, 'id')

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID parameter is required'
            });
        }

        // Check if whisper.json already exists
        const whisperJsonPath = path.join(process.cwd(), 'public', 'data', 'uploads', id, 'transcript', 'whisper.json');

        if (fs.existsSync(whisperJsonPath)) {
            // Read and return existing transcription
            const existingTranscription = JSON.parse(fs.readFileSync(whisperJsonPath, 'utf8'));
            return {
                success: true,
                transcription: existingTranscription,
                cached: true,
                savedTo: whisperJsonPath
            };
        }

        // Construct the audio file path with the dynamic id
        const audioPath = path.join(process.cwd(), 'public', 'data', 'uploads', id, 'audio', 'audio.m4a');

        // Check if audio file exists
        if (!fs.existsSync(audioPath)) {
            throw createError({
                statusCode: 404,
                statusMessage: `Audio file not found at path: ${audioPath}`
            });
        }

        const audioStream = fs.createReadStream(audioPath);

        // Ensure the directory exists
        const whisperDir = path.dirname(whisperJsonPath);
        if (!fs.existsSync(whisperDir)) {
            fs.mkdirSync(whisperDir, { recursive: true });
        }

        // Create new transcription
        const transcription = await openai.audio.transcriptions.create({
            file: audioStream,
            model: "whisper-1",
            response_format: "verbose_json"
        });

        // Write the transcription to whisper.json
        fs.writeFileSync(whisperJsonPath, JSON.stringify(transcription, null, 2));

        return {
            success: true,
            transcription,
            cached: false,
            savedTo: whisperJsonPath
        };
    } catch (error) {
        console.error('Transcription error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        });
    }
});
