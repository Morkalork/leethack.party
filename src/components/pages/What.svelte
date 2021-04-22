<script lang="ts">
  import LeetHackExample from '../specific/LeetHackExample.svelte'
</script>

<div class="wrapper" id="what">
  <div class="card">
    <section>
      <h2>What is LeetHack?</h2>
      <p>
        LeetHack is a programming puzzle game, by developers, for developers!
        Instead of finding keys behind plants and locating clues inside of old
        television sets, you find keys in data, locate clues inside of source
        code and API's.
      </p>
      <p>
        Most of us developers don't get to use our programming skills
        offensively, or at least competitively, during a normal workday.
        LeetHack helps to alleviate some of the worst pains of holding your
        skills back!
      </p>
    </section>
    <section>
      <h2>What are you talking about?</h2>
      <p>
        If you know how to create a loop, how to split a string, how to make an
        if-statement you know more than enough to handle yourself in the world
        of LeetHack. The game is also designed to often allow different kinds of
        solutions, brute force as well as clever little algorithms. Not all
        developers work in the same way and even if you are a
        <s>scriptkiddie</s> different kind of developer, your skills may yet prove
        indispensible in our little game.
      </p>
    </section>
  </div>
  <div class="card">
    <section>
      <h2>Is there a way for me to see if I can do this?</h2>
      <p>
        Sure, how about a little example? If you can sum up all the digits in
        the following data-dump and enter the number below, you qualify to
        participate in LeetHack:
      </p>
      <LeetHackExample />
    </section>
  </div>
</div>

<style>
  .wrapper {
    position: relative;
    background-color: #191f1a;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .card {
    position: relative;
    background-color: #1c291c;
    padding: 1rem;
    width: clamp(90%, 50vw, 50rem);
    flex-grow: 1;
    flex-basis: 0;
    margin: 1rem 0;
    max-width: 60vw;
    font-size: clamp(0.85rem, calc(1.25 / 80 * 100vw), 1.25rem);
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  p,
  h2 {
    color: #33ff33;
  }

  @media only screen and (min-width: 1201px) {
    .wrapper {
      flex-direction: row;
      justify-content: space-evenly;
    }

    .card {
      min-height: 60vh;
      max-width: 40vw;
    }
  }

  @media only screen and (max-width: 1200px) {
    .card {
      max-width: 85%;
    }

    .wrapper {
      padding-bottom: 5rem;
    }
  }
</style>
