<script lang="ts">
  import What from './components/pages/What.svelte'
  import Home from './components/pages/Home.svelte'
  import Who from './components/pages/Who.svelte'
  import Footer from './components/common/Footer.svelte'
  import NextButton from './components/common/NextButton.svelte'
  import { GoogleAnalytics } from '@beyonk/svelte-google-analytics'
</script>

<GoogleAnalytics properties={['G-W14NYZZ98Z']} />
<main>
  <Home />
  <What />
  <Who />
  <Footer />
  <NextButton />
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');
  main {
    height: 100%;
  }

  :global(html) {
    padding: 0;
    scroll-behavior: smooth;
    margin: 0;
  }
  :global(body) {
    padding: 0;
    font-family: 'Fira Code', monospace;
    color: #33ff33;
    margin: 0;
  }

  :global(a) {
    text-decoration: none;
    color: #33ff33;
  }

  :global(p) {
    margin: 0;
  }
</style>
