<script lang="ts">
  export let src: string
  export let alt: string
</script>

<div class="portrait-wrapper">
  <span class="portrait-image">
    <img {src} {alt} />
  </span>
</div>

<style>
  .portrait-wrapper {
    position: relative;
    width: clamp(8rem, calc(20 / 80 * 100vw), 20rem);
  }
  .portrait-image {
    height: clamp(4rem, calc(10 / 80 * 100vw), 10rem);
    width: clamp(4rem, calc(10 / 80 * 100vw), 10rem);
    border-radius: 50%;
    overflow: hidden;
    position: absolute;
    background: #fff;
    box-shadow: 0 0 0.5rem #191f1a;
  }

  .portrait-image img {
    width: 80%;
    position: absolute;
    left: 50%;
    transform: translate3d(-50%, 10%, 0);
  }

  @media only screen and (max-width: 1000px) {
    .portrait-image {
    }
  }
</style>
