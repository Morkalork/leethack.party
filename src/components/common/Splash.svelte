<script lang="ts">
  export let backgroundColor = ''
  export let anchor = ''
</script>

<div class="splash" style="background-color: {backgroundColor};" id={anchor}>
  <slot />
</div>

<style>
  .splash {
    width: 100%;
    position: relative;
    overflow: hidden;
    min-height: 100vh;
  }
</style>
