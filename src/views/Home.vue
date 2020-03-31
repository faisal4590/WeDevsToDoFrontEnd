<template>
  <div class="home">
    <TODO />
  </div>
</template>

<script>
// @ is an alias to /src
import TODO from "@/components/ToDoComponent.vue";

export default {
  name: "Home",
  components: {
    TODO
  }
};
</script>
