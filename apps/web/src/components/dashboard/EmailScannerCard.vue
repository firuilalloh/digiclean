<script setup>
import { ref, computed } from "vue";
import { useDigiCleanApi } from "@/composables/digiCleanApi";

const { isScanning, scanResults, scanError, scanEmail } = useDigiCleanApi();

const searchQuery = ref("");
const selectedTab = ref("ALL"); // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'

// State untuk Modal Edukasi
const selectedService = ref(null);
const showDeleteGuide = ref(false);

const openDetailModal = (service) => {
  selectedService.value = service;
  showDeleteGuide.value = false; // Reset toggle setiap kali modal baru dibuka
};

const closeModal = () => {
  selectedService.value = null;
  showDeleteGuide.value = false;
};

// Stats Counter
const stats = computed(() => {
  const total = scanResults.value.length;
  const high = scanResults.value.filter(
    (item) => item.risk?.level === "HIGH",
  ).length;
  const medium = scanResults.value.filter(
    (item) => item.risk?.level === "MEDIUM",
  ).length;
  const low = scanResults.value.filter(
    (item) => item.risk?.level === "LOW",
  ).length;

  return { total, high, medium, low };
});

// Filtered List berdasarkan Search & Tab
const filteredServices = computed(() => {
  return scanResults.value.filter((service) => {
    const matchSearch =
      service.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      service.domain.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchTab =
      selectedTab.value === "ALL" || service.risk?.level === selectedTab.value;

    return matchSearch && matchTab;
  });
});

// Helper Format Tanggal
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};
</script>

<template>
  <div class="space-y-5">
    <!-- Action Button -->
    <button
      @click="scanEmail"
      :disabled="isScanning"
      class="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-[0.99]"
    >
      <span v-if="isScanning" class="animate-spin text-lg">🔍</span>
      <span>{{
        isScanning
          ? "Memindai Seluruh Sejarah Inbox..."
          : "🔍 Audit Footprint Digital"
      }}</span>
    </button>

    <!-- Error Alert -->
    <div
      v-if="scanError"
      class="p-4 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-400"
    >
      ⚠️ {{ scanError }}
    </div>

    <!-- Summary Stats Matrix (Hanya Muncul Jika Ada Data) -->
    <div
      v-if="scanResults.length > 0"
      class="grid grid-cols-4 gap-2 text-center"
    >
      <div
        @click="selectedTab = 'ALL'"
        :class="[
          'p-2.5 rounded-xl border transition-all cursor-pointer',
          selectedTab === 'ALL'
            ? 'bg-slate-800 border-indigo-500'
            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700',
        ]"
      >
        <span class="text-[10px] text-slate-400 block font-medium">Total</span>
        <span class="text-sm font-bold text-white font-mono">{{
          stats.total
        }}</span>
      </div>

      <div
        @click="selectedTab = 'HIGH'"
        :class="[
          'p-2.5 rounded-xl border transition-all cursor-pointer',
          selectedTab === 'HIGH'
            ? 'bg-red-950/80 border-red-500'
            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700',
        ]"
      >
        <span class="text-[10px] text-red-400 block font-medium"
          >High Risk</span
        >
        <span class="text-sm font-bold text-red-400 font-mono">{{
          stats.high
        }}</span>
      </div>

      <div
        @click="selectedTab = 'MEDIUM'"
        :class="[
          'p-2.5 rounded-xl border transition-all cursor-pointer',
          selectedTab === 'MEDIUM'
            ? 'bg-amber-950/80 border-amber-500'
            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700',
        ]"
      >
        <span class="text-[10px] text-amber-400 block font-medium">Medium</span>
        <span class="text-sm font-bold text-amber-400 font-mono">{{
          stats.medium
        }}</span>
      </div>

      <div
        @click="selectedTab = 'LOW'"
        :class="[
          'p-2.5 rounded-xl border transition-all cursor-pointer',
          selectedTab === 'LOW'
            ? 'bg-emerald-950/80 border-emerald-500'
            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700',
        ]"
      >
        <span class="text-[10px] text-emerald-400 block font-medium"
          >Low Risk</span
        >
        <span class="text-sm font-bold text-emerald-400 font-mono">{{
          stats.low
        }}</span>
      </div>
    </div>

    <!-- Filter & Search Input -->
    <div v-if="scanResults.length > 0" class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari platform atau domain (mis: Spotify)..."
        class="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
      />
      <span
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="absolute right-3 top-2.5 text-xs text-slate-500 cursor-pointer hover:text-slate-300"
        >✕</span
      >
    </div>

    <!-- Empty State -->
    <div
      v-if="!isScanning && scanResults.length === 0 && !scanError"
      class="text-center py-8 border border-dashed border-slate-800/80 rounded-2xl"
    >
      <p class="text-xs text-slate-500">
        Klik **Audit Footprint Digital** untuk menyapu seluruh jejak email kamu.
      </p>
    </div>

    <!-- Results List -->
    <div v-if="scanResults.length > 0" class="space-y-2">
      <div
        class="flex items-center justify-between px-1 text-xs text-slate-400"
      >
        <span>Layanan Terdeteksi ({{ filteredServices.length }})</span>
        <span
          v-if="selectedTab !== 'ALL'"
          class="text-[10px] text-indigo-400 font-mono"
          >Filter: {{ selectedTab }}</span
        >
      </div>

      <div class="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        <div
          v-for="service in filteredServices"
          :key="service.id"
          @click="openDetailModal(service)"
          class="bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/50 rounded-xl p-3 flex items-center justify-between transition-all group cursor-pointer"
        >
          <!-- Platform Icon & Info -->
          <div class="flex items-center gap-3 min-w-0">
            <img
              :src="`https://www.google.com/s2/favicons?domain=${service.domain}&sz=64`"
              class="w-8 h-8 rounded-lg bg-slate-900 p-1 border border-slate-800 shrink-0"
              alt="logo"
            />
            <div class="truncate">
              <div class="flex items-center gap-2">
                <h4
                  class="text-xs font-semibold text-slate-200 capitalize truncate"
                >
                  {{ service.name }}
                </h4>

                <!-- ⬇️ PERUBAHAN DI SINI: Risk / Breach Badge Status ⬇️ -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <!-- Peringatan Khusus Jika Kebocoran Data (Breached) -->
                  <span
                    v-if="service.risk?.isBreached"
                    :title="service.risk.reason"
                    class="text-[9px] font-black px-2 py-0.5 rounded bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30 flex items-center gap-1 cursor-help"
                  >
                    🚨 BREACHED
                  </span>

                  <!-- Regular Risk Badge -->
                  <span
                    v-else-if="service.risk"
                    :title="service.risk.reason"
                    :class="[
                      'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 cursor-help',
                      service.risk.level === 'HIGH'
                        ? 'bg-red-950/80 text-red-400 border border-red-800/50'
                        : '',
                      service.risk.level === 'MEDIUM'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                        : '',
                      service.risk.level === 'LOW'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                        : '',
                    ]"
                  >
                    {{ service.risk.level }}
                  </span>
                </div>
                <!-- ⬆️ END PERUBAHAN ⬆️ -->
              </div>
              <p class="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                {{ service.domain }}
              </p>
            </div>
          </div>

          <!-- Date Registered -->
          <div class="text-right shrink-0 ml-2">
            <span class="text-[9px] text-slate-500 block">Terdaftar</span>
            <span class="text-[11px] font-mono text-slate-400">{{
              formatDate(service.detectedAt)
            }}</span>
          </div>
        </div>

        <!-- Modal Edukasi Keamanan -->
        <!-- Modal Detail & Edukasi -->
        <div
          v-if="selectedService"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          @click.self="closeModal"
        >
          <div
            class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <!-- Header Modal -->
            <div
              class="flex items-center justify-between border-b border-slate-800 pb-3"
            >
              <div class="flex items-center gap-2.5">
                <img
                  :src="`https://www.google.com/s2/favicons?domain=${selectedService.domain}&sz=64`"
                  class="w-7 h-7 rounded-lg bg-slate-950 p-1 border border-slate-800"
                  alt="logo"
                />
                <h3 class="text-sm font-bold text-white capitalize">
                  {{ selectedService.name }}
                </h3>
              </div>
              <button
                @click="closeModal"
                class="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- Status Keamanan & Tombol How to Delete -->
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-400">Status:</span>
                  <span
                    v-if="selectedService.risk?.isBreached"
                    class="text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white animate-pulse shrink-0"
                  >
                    🚨 BREACH RECORDED
                  </span>
                  <span
                    v-else
                    :class="[
                      'text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0',
                      selectedService.risk?.level === 'HIGH'
                        ? 'bg-red-950 text-red-400 border border-red-800/50'
                        : '',
                      selectedService.risk?.level === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                        : '',
                      selectedService.risk?.level === 'LOW'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                        : '',
                    ]"
                  >
                    {{ selectedService.risk?.level }} RISK
                  </span>
                </div>

                <!-- 🔴 TOMBOL "HOW TO DELETE ACCOUNT" (Hanya Muncul di High Risk / Breached) -->
                <button
                  v-if="
                    selectedService.risk?.level === 'HIGH' ||
                    selectedService.risk?.isBreached
                  "
                  @click="showDeleteGuide = !showDeleteGuide"
                  class="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>{{
                    showDeleteGuide ? "📖 Hide Guide" : "🗑️ How to Delete?"
                  }}</span>
                </button>
              </div>

              <p
                class="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800"
              >
                Domain: {{ selectedService.domain }}
              </p>
            </div>

            <!-- 🔴 KONTEN TOGGLE: PANDUAN CARA HAPUS AKUN (HANYA MUNCUL KETIKA TOMBOL DIKLIK) -->
            <div
              v-if="showDeleteGuide"
              class="bg-red-950/30 border border-red-900/50 p-3.5 rounded-xl space-y-2 animate-fade-in"
            >
              <h4
                class="text-xs font-bold text-red-400 flex items-center gap-1.5"
              >
                🗑️ Langkah Panduan Menutup Akun
              </h4>

              <ol
                class="text-[11px] text-slate-300 space-y-1.5 list-decimal pl-4 leading-relaxed"
              >
                <li>
                  Buka website
                  <span class="font-mono text-indigo-400 underline">{{
                    selectedService.domain
                  }}</span>
                  dan masuk ke menu <em>Settings / Account Security</em>.
                </li>
                <li>
                  Cari tombol/menu <strong>"Delete Account"</strong> atau
                  <strong>"Close Account"</strong> di bagian bawah halaman
                  profil.
                </li>
                <li>
                  Jika daftar menggunakan Google OAuth, pastikan juga mencabut
                  aksesnya di
                  <em>Google Account > Security > Third-party apps</em>.
                </li>
                <li>
                  Jika opsi hapus tidak ada di website, kirim request
                  penghapusan data via email support layanan tersebut.
                </li>
              </ol>
            </div>

            <!-- 💡 KONTEN EDUKASI REGULAR -->
            <div
              v-else
              class="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-2"
            >
              <h4
                class="text-xs font-semibold text-indigo-400 flex items-center gap-1.5"
              >
                💡 Tips & Edukasi Keamanan
              </h4>

              <ul
                v-if="selectedService.risk?.isBreached"
                class="text-[11px] text-slate-300 space-y-1.5 list-disc pl-4"
              >
                <li>
                  <strong>Layanan Pernah Bocor:</strong> Kebocoran terjadi di
                  server internal platform. Ini bukan berarti email kamu di-hack
                  saat ini.
                </li>
                <li>
                  <strong>Password Reuse:</strong> Jika kamu memakai password
                  yang sama di layanan ini untuk email lain,
                  <strong>segera ganti password</strong> di layanan lain
                  tersebut.
                </li>
                <li>
                  <strong>Aktifkan 2FA:</strong> Gunakan Authenticator App untuk
                  proteksi ekstra.
                </li>
              </ul>

              <ul
                v-else
                class="text-[11px] text-slate-300 space-y-1.5 list-disc pl-4"
              >
                <li>
                  <strong>Akun Terdaftar:</strong> Email kamu terhubung ke
                  platform ini.
                </li>
                <li>
                  <strong>Evaluasi Rutin:</strong> Jika akun ini sudah tidak
                  pernah kamu pakai lagi, pertimbangkan untuk menutupnya di masa
                  mendatang.
                </li>
              </ul>
            </div>

            <!-- Action Close -->
            <button
              @click="closeModal"
              class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition duration-200 cursor-pointer"
            >
              Paham, Tutup Informasi
            </button>
          </div>
        </div>

        <div
          v-if="filteredServices.length === 0"
          class="text-center py-6 text-xs text-slate-500"
        >
          Tidak ada layanan yang cocok dengan pencarian / filter.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #020617;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
}
</style>
