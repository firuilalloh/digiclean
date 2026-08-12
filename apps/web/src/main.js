import { createApp } from "vue";
import { clerkPlugin } from "vue-clerk";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
});

app.mount("#app");
