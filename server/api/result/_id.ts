
export default defineEventHandler((event) => {
    const id = getRouterParam(event, 'id')

    return {
        hello2: 'world',
        id
    }
})
