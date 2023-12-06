<template>
  <div
    class="row row-cols-1 col-sm-12 border"
    style="margin: auto; width: 90%; margin: auto"
  >
    <div class="col-12 py-2">
      <div class="row row-cols-2 cols-12">
        <div class="col-2">
          <label for="id"> Alias </label>
        </div>
        <div class="col-5">
          <input type="text" id="id" class="form-control" v-model="name" />
        </div>
      </div>
    </div>
    <div
      class="col bg-dark py-1 text-light overflow-scroll"
      style="height: 500px"
    >
      <p class="border-bottom" v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg[0] }}: </strong>{{ msg[1] }}
      </p>
    </div>
    <div class="col mt-2">
      <div class="row row-cols-2 px-0 col-12">
        <div class="col-9 px-0">
          <input
            class="form-control"
            type="text"
            name="message"
            id="message"
            v-model="message"
            placeholder="Escribe un mensaje"
            @keyup.enter="sendMessage"
          />
        </div>
        <div class="col-3 px-1">
          <button class="btn btn-info btn-inline" @click="sendMessage">
            enviar
          </button>
          <button class="btn mx-2 btn-danger" @click="closeConexion()">
            unsubscribe
          </button> 
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      message: null,
      messages: [],
      name: null,
    };
  },
  mounted() {
    this.$echo.channel("chat").listen("message", (msg) => {
      this.messages.push([msg.id, msg.message]);
    });

    this.$echo.channel("chat").listen("authorize", (msg) => {
      this.messages.push([msg.id, msg.message]);
    });
  
    this.$echo.closed((close) => {
      console.log(close);
    });

    this.$echo.error((error) => {
      console.log(error);
    });
  },

  methods: {
     
    closeConexion() {
      this.$echo.unsubscribe();
    },
    sendMessage() {
      this.$echo.channel("chat").event("message", this.message, this.name);
      this.message = null;
    },
  },
};
</script>
<style lang=""></style>
