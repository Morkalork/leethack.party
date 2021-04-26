<script lang="ts">
  import Splash from '../common/Splash.svelte'
  import { fade } from 'svelte/transition'
  import { onMount } from 'svelte'

  let show = false
  let showOverlay = false

  let nextEvent = {
    date: new Date(2021, 4, 15),
    text: 'Global Remote Event!'
  }

  const getEventText = () => {
    const now = new Date()
    const { date, text } = nextEvent
    const diff = date.getTime() - now.getTime()
    if (diff < 0) {
      return '...who knows?'
    }

    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${text}`
  }

  onMount(() => {
    const backgroundImage = new Image()
    backgroundImage.src = '/images/splash.jpg'
    backgroundImage.onload = () => {
      show = true
      const overlayImage = new Image()
      overlayImage.src = '/images/overlay.png'
      overlayImage.onload = () => {
        showOverlay = true
      }
    }
  })
</script>

<Splash backgroundColor="#191B1A">
  {#if show}
    <div
      transition:fade={{ duration: 500 }}
      class="background background-image"
    >
      <h1 transition:fade={{ duration: 2000 }}>LeetHack</h1>
      {#if showOverlay}
        <div
          transition:fade={{ duration: 2000 }}
          class="overlay background-image"
        />
      {/if}
      <p transition:fade={{ duration: 1000, delay: 2000 }} class="tagline">
        Challenge yourself, polyglotical mayhem!
      </p>
      <p transition:fade={{ duration: 1000, delay: 1000 }} class="promo">
        <strong>Next event:</strong>
        {getEventText()}
      </p>
    </div>
  {:else}
    <div class="loading">
      <p>Loading transmorglyphs...</p>
    </div>
  {/if}
</Splash>

<style>
  .loading {
    color: #33ff33;
    opacity: 0.25;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  h1 {
    margin: 0;
    font-size: clamp(2rem, 10vw, 20rem);
  }
  p {
    font-size: 3rem;
    font-size: clamp(0.75rem, 3vw, 3rem);
    position: absolute;
    opacity: 0.75;
    margin: 0;
  }

  h1,
  p {
    color: #33ff33;
    text-transform: uppercase;
    text-shadow: 0 0 1rem #000;
  }

  .tagline {
    top: 1rem;
    left: 1rem;
  }

  .promo {
    bottom: 1rem;
    right: 2rem;
  }

  .background-image {
    height: 100vh;
    background-size: cover;
    background-position: center center;
  }

  .background {
    background-image: url('/images/splash.jpg');
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .overlay {
    background-image: url('/images/overlay.png');
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
  }

  @media only screen and (max-width: 1200px) {
    .tagline,
    .promo {
      text-align: center;
      right: 0.5rem;
      left: 0.5rem;
    }
    .promo {
      bottom: 2rem;
    }
  }
</style>
