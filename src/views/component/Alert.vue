<template>
  <div>
    <v-alert
      :value="alertShow"
      :type="alertType"
      transition="scale-transition"
    >{{alertMsg}}</v-alert>
  </div>
</template>

<script>
  export default {
    name: 'AlertControl',
    props: ['show', 'type', 'msg'],
    data() {
      return {
        alertShow: false,
        alertType: 'success',
        alertMsg: '',
      };
    },
    methods: {
      showAlert: function(type, msg, duration = 3000) {
        this.alertShow = true;
        this.alertType = type;
        this.alertMsg  = msg;
        setTimeout(() => {
          this.alertShow = false;
        }, duration);
      },
    },
  };
</script>

