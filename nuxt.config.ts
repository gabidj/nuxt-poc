// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/image'],
  vite: {
  },
  pages: true,
  runtimeConfig: {
    // Private keys (only available on server-side)
    openAiKey: process.env.OPENAI_API_KEY,
  }
})
