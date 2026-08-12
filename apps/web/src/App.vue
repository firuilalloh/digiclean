<script setup>
import {
  SignedIn,
  SignedOut,
  AuthenticateWithRedirectCallback,
} from "vue-clerk";
import AppHeader from "@/components/layout/AppHeader.vue";
import AuthCard from "@/components/auth/AuthCard.vue";
import AccountHeader from "@/components/dashboard/AccountHeader.vue";
import EmailScannerCard from "@/components/dashboard/EmailScannerCard.vue";

// Cek apakah URL saat ini adalah path /sso-callback
const isSsoCallback = window.location.pathname === "/sso-callback";
</script>

<template>
  <!-- 1. Jika sedang di rute /sso-callback, biarkan Clerk menyelesaikan autentikasi -->
  <div
    v-if="isSsoCallback"
    class="min-h-screen bg-slate-950 flex items-center justify-center text-white"
  >
    <AuthenticateWithRedirectCallback />
  </div>

  <!-- 2. Jika bukan di callback, jalankan tampilan normal kamu -->
  <div
    v-else
    class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 antialiased selection:bg-indigo-500 selection:text-white overflow-hidden"
  >
    <!-- Header Layout -->
    <AppHeader />

    <!-- Main Workspace Container -->
    <main class="w-full max-w-md">
      <!-- Unauthenticated -->
      <SignedOut>
        <AuthCard />
      </SignedOut>

      <!-- Authenticated Dashboard -->
      <SignedIn>
        <div
          class="opacity-0 animate-fade-up delay-4 bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-6"
        >
          <AccountHeader />
          <EmailScannerCard />
        </div>
      </SignedIn>
    </main>
  </div>
</template>
