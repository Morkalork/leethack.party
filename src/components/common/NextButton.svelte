<script lang="ts">
  import { onMount } from 'svelte'

  import { fade } from 'svelte/transition'

  let anchors = ['what', 'who']

  let mounted = false
  let pointUp = false
  let lastElement: HTMLElement

  const handleOnClick = () => {
    for (let anchor of anchors) {
      const element = document.getElementById(anchor)
      const elementTop = element.offsetTop
      if (elementTop > window.scrollY) {
        location.href = `#${anchor}`
        return
      }
    }

    location.href = '#'
  }

  onMount(() => {
    mounted = true
    lastElement = document.getElementById(anchors[anchors.length - 1])
    onScroll()
  })

  const onScroll = () => {
    const lastTop = lastElement.getBoundingClientRect().top + window.pageYOffset
    if (window.pageYOffset >= lastTop) {
      pointUp = true
    } else {
      pointUp = false
    }
  }
</script>

{#if mounted}
  <p
    transition:fade={{ duration: 2000, delay: 1000 }}
    class="next-button"
    class:pointUp
  >
    <span on:click={handleOnClick}><strong>&gt;</strong></span>
  </p>
{/if}

<svelte:window on:scroll={onScroll} />

<style>
  .next-button {
    position: fixed;
    bottom: 1rem;
    left: 3rem;
    font-size: 10rem;
    font-size: clamp(2rem, calc(10 / 80 * 100vw), 10rem);
    border-radius: 50%;
    transform: rotate(90deg);
    transition: 0.5s;
    text-shadow: 0 0 0.5rem #000;
  }

  .next-button.pointUp {
    transform: rotate(270deg);
  }

  .next-button:hover {
    bottom: 1.5rem;
    cursor: pointer;
  }

  @keyframes turnDown {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(90deg);
    }
  }

  @media only screen and (max-width: 1200px) {
    .next-button {
      left: calc(50% - 1rem);
      bottom: 1rem;
      user-select: none;
    }
  }
</style>
