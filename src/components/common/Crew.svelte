<script lang="ts">
  import PortraitImage from './PortraitImage.svelte'
  export let image: string
  export let title: string
</script>

<article>
  <PortraitImage src={image} alt={title} />
  <section>
    <h2>{title}</h2>
    <span>
      <slot />
    </span>
  </section>
</article>

<style>
  article {
    display: flex;
    justify-content: space-around;
    margin-top: 2rem;
  }
  section {
    max-width: 70%;
  }

  h2,
  span {
    color: #33ff33;
    margin: 0;
  }

  span {
    font-size: clamp(0.85rem, calc(1.25 / 80 * 100vw), 1.25rem);
  }
</style>
