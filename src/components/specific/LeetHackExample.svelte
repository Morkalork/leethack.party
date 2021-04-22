<script lang="ts">
  import { slide } from 'svelte/transition'
  import { ga } from '@beyonk/svelte-google-analytics'

  let answer: number
  let correctAnswer: boolean
  let almostCorrect: boolean
  let showHint = false

  const data =
    '1239841I239684126351|123968142asdf9184236123615213asd98§1243162351962834asdf98124391823E49123489asdf8s8213kj123312098sadleethackfasdf023409312cv23453456hgg43561337asdf999lorem1448brooklyn990987654321foey35446849984asdf984qwe98e49qw65168q4we98qw4e9849as8d49as849q8w98946632165688qw65198lol19423a3se1235www1337H4CkP4r7Ycom88866674599872221135168498765164953e849486351p65498498r7782o6984c61321k6584s!11123456789'

  const onAnswerChange = () => {
    correctAnswer = undefined
    almostCorrect = undefined
  }

  const onSubmit = () => {
    const realAnswer = data
      .replace(/\D/g, '')
      .split('')
      .map((digit) => Number(digit))
      .reduce((acc, val) => acc + val, 0)
    correctAnswer = answer === realAnswer
    if (!correctAnswer) {
      if (Math.abs(realAnswer - answer) < 10) {
        almostCorrect = true
      }
    }
    ga.addEvent('run_example', {
      success: correctAnswer
    })
  }

  const onShowHint = () => {
    showHint = true
  }
</script>

<div class="leethack-example">
  <p class="data"><code>{data}</code></p>
  <p class="hint">
    <strong title="click me for a hint!" on:click={onShowHint}>Hint?</strong>
    {#if showHint}
      <span><em>1a2b3c</em> would in this example equal 6...</span>
    {/if}
  </p>
  <br />
  <p class="input-fields">
    <input
      type="number"
      placeholder="Enter you answer..."
      on:keydown={onAnswerChange}
      bind:value={answer}
    />
    <button on:click={onSubmit}>Send in answer</button>
  </p>
  <div class="answer">
    {#if answer !== undefined}
      {#if correctAnswer === true}
        <p transition:slide|local>
          🎉 You are definitely ready for LeetHack, congratulations!
        </p>
      {:else if correctAnswer === false}
        {#if almostCorrect}
          <p>It is so close, but not quite close enough :)</p>
        {:else}
          <p transition:slide|local>
            Unfortunately, that was not quite the answer we were looking for.
            But please give it another go!
          </p>
        {/if}
      {:else}
        <p>&nbsp;</p>
      {/if}
    {:else}
      <p>&nbsp;</p>
    {/if}
  </div>
</div>

<style>
  .leethack-example {
    padding-bottom: 3rem;
  }
  .hint {
    cursor: pointer;
  }

  .data {
    word-wrap: break-word;
    margin: 1rem;
    padding: 1rem;
    font-style: italic;
  }

  button {
    color: #33ff33;
    background-color: #e36d00;
    border: none;
    border-radius: 4px;
    opacity: 0.9;
  }

  button:hover {
    cursor: pointer;
    opacity: 1;
  }

  input[type='number'] {
    background-color: #161616;
    color: #33ff33;
    -moz-appearance: textfield;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'],
  button {
    margin-top: 1rem;
    font-size: clamp(1.25rem, calc(2 / 80 * 100vw), 2rem);
    border-radius: 4px;
    padding: 0.25rem;
    border: 2px #e36d00 solid;
  }

  .answer {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
  }

  @media only screen and (max-width: 1200px) {
    input,
    button {
      width: 90%;
      margin: 0.25rem auto;
    }
    .input-fields {
      text-align: center;
    }
    .leethack-example {
      padding-bottom: 4rem;
    }
  }
</style>
