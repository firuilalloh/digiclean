<script setup>
defineProps({
  isReady: Boolean,
});
</script>

<template>
  <header class="mb-8 text-center flex flex-col items-center">
    <!-- Badge -->
    <div
      class="opacity-0 animate-fade-up delay-1 inline-flex items-center gap-2.5 bg-slate-900 border border-slate-800/80 px-4 py-1.5 rounded-full mb-4 shadow-xl"
    >
      <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
      <span class="text-xs font-bold tracking-wider text-indigo-400 uppercase"
        >DigiClean Engine v1.0</span
      >
    </div>

    <!-- Title -->
    <h1
      class="opacity-0 animate-fade-up delay-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text"
    >
      Digital Clean Workspace
    </h1>
  </header>
</template>
