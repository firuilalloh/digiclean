<script setup>
import { UserButton } from "vue-clerk";
</script>

<template>
  <div
    class="flex items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-slate-800/80"
  >
    <div>
      <p class="text-xs font-medium text-slate-400">Status Akun</p>
      <p
        class="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Terverifikasi
      </p>
    </div>
    <UserButton />
  </div>
</template>
