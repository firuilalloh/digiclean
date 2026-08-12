<script setup>
import { digiCleanApi } from "@/composables/digiCleanApi";

const { apiResponse, isLoading, testProtectedApi } = digiCleanApi();
</script>

<template>
  <div class="space-y-4">
    <button
      @click="testProtectedApi"
      type="button"
      :disabled="isLoading"
      class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-[0.99]"
    >
      <span v-if="isLoading" class="animate-spin text-lg">⏳</span>
      <span>{{
        isLoading
          ? "Connecting to Backend..."
          : "🚀 Tes Hit Express Backend API"
      }}</span>
    </button>

    <!-- Response Terminal Output -->
    <div v-if="apiResponse" class="mt-4">
      <div
        class="flex items-center justify-between text-xs text-slate-400 mb-2 px-1"
      >
        <span>Server Response</span>
        <span class="font-mono text-indigo-400">HTTP 200</span>
      </div>
      <div
        class="bg-slate-950 border border-slate-800/80 rounded-xl p-4 overflow-x-auto font-mono text-xs text-emerald-400 shadow-inner"
      >
        <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>
