import { ref } from "vue";
import { useAuth } from "vue-clerk";

export function useDigiCleanApi() {
  const { getToken } = useAuth();

  const isScanning = ref(false);
  const scanResults = ref([]);
  const scanError = ref(null);

  const scanEmail = async () => {
    isScanning.value = true;
    scanError.value = null;

    try {
      const token = await getToken.value();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/scan-email`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal melakukan scanning email");
      }

      scanResults.value = data.data;
    } catch (err) {
      console.error("Scan API Error:", err);
      scanError.value = err.message;
    } finally {
      isScanning.value = false;
    }
  };

  return {
    isScanning,
    scanResults,
    scanError,
    scanEmail,
  };
}
