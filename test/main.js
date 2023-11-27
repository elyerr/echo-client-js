import "./assets/main.css";
import EchoClient from "../distribution/EchoClient";
import { createApp } from "vue";
import App from "./App.vue";

const echo = new EchoClient({
  host: "auth.spondylus.xyz",
  port: "6010",
  transport: 'ws',
  auth: {
    headers: {
      Authotization: "some_key",
    },
  },
});

const app = createApp(App);
app.config.globalProperties.$echo = echo;
app.mount("#chat");
