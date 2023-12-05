import "./assets/main.css";
import EchoClient from "../distribution/EchoClient";
import { createApp } from "vue";
import App from "./App.vue";

const echo = new EchoClient({
  driver: "null", 
  host: "auth.spondylus.xyz",
  port: "6010",
  transport: 'ws',
  channels:"chat",
  /*  headers: {
      Authotization: "token",
    },*/
});

const app = createApp(App);
app.config.globalProperties.$echo = echo;
app.mount("#chat");
