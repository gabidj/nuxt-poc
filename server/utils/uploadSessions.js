// Shared upload sessions store
export const uploadSessions = new Map()

// Optional: Add cleanup for expired sessions
export const cleanupExpiredSessions = () => {
    const now = new Date()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    for (const [uploadId, session] of uploadSessions.entries()) {
        if (now - session.createdAt > maxAge) {
            uploadSessions.delete(uploadId)
            console.log(`Cleaned up expired session: ${uploadId}`)
        }
    }
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000)
