<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import '@/assets/tailwind.css';
useHead({
  script: [
    {
      src: 'https://cdn.tailwindcss.com/3.4.17',
      async: true,
      defer: true,
      'data-interval': '1 week'
    }
  ],
});
</script>
