<script lang="ts">
  import Crew from '../common/Crew.svelte'
</script>

<div class="wrapper" id="who">
  <div class="left">
    <img
      src="/images/crew_portrait_artsy.jpg"
      class="us"
      alt="The LeetHack Crew"
    />
  </div>
  <div class="right">
    <h2>The LeetHack Crew</h2>
    <Crew image="/images/otto.png" title="Otto Remse">
      The LeetHack Azure/Backend guru. A dot net architect who has been with the
      project since day one. Enjoys growing chilis, and FPS.
    </Crew>
    <Crew image="/images/brassman.png" title="Mikael Brassman">
      The resident designer and frontend developer. Map maker, special effects
      master and part of the crew since early days. Also a game developer and
      Switch lord.
    </Crew>
    <Crew image="/images/ferm.png" title="Magnus Ferm">
      Frontend developer and story writer. Responsible for a large portion of
      the rooms and has been with the project from the start. The teams biggest
      <a
        href="http://www.mff.se"
        title="Oh we love Malmö FF, oh we love our team. Beneath heavenly blue skies, we become stronger and better for every day that passes..."
        >Malmö FF</a
      > supporter!
    </Crew>
  </div>
</div>

<style>
  .wrapper {
    background-color: #3b6921;
    min-height: 100vh;
    display: flex;
  }

  h2,
  a {
    color: #33ff33;
  }

  h2 {
    margin-bottom: 3rem;
    font-size: clamp(1.25rem, calc(4 / 80 * 100vw), 4rem);
  }

  a {
    font-weight: bold;
  }

  .wrapper > div {
    flex-grow: 1;
    flex-basis: 0;
  }

  .left {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    padding-right: 1rem;
  }

  img.us {
    border-radius: 50%;
    max-width: 30vw;
    box-shadow: 0 0 0.5rem #191f1a;
  }

  @media only screen and (max-width: 1000px) {
    .wrapper {
      flex-direction: column-reverse;
      padding: 3rem 0.5rem;
    }

    img.us {
      margin-top: 3rem;
    }
  }
</style>
