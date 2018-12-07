<template>
  <div class="landing">
    <div class="center">
      <canvas ref="canvas"></canvas>

      <div class="about">
        <h1 class="headline">Rip Off</h1>

        <p>
          This game is loosely inspired by the 1980s arcade game
          <a href="https://www.arcade-museum.com/game_detail.php?game_id=9326" target="_blank">"Rip Off" by
            Cinematronics</a>.
        </p>

        <h2>How to play</h2>

        <p>Goal of the game is to prevent the enemy ships from stealing your fuel tanks for as long as possible.
          The game is cooperative, so if you're playing with a friend you're working for a common goal. But no worries,
          you'll get the competitive factor through the score of enemy ships destroyed at the top of the screen.</p>

        <div class="controls">
          <div>
            <h3>Player 1</h3>

            <div class="key-mapping">
              Fire <span class="key" v-html="getKeyName(keyNameEnum.Player1Fire)"></span>
            </div>
            <div class="key-mapping">
              Accelerate <span class="key" v-html="getKeyName(keyNameEnum.Player1Thrust)"></span>
            </div>
            <div class="key-mapping">
              Turn left <span class="key" v-html="getKeyName(keyNameEnum.Player1Left)"></span>
            </div>
            <div class="key-mapping">
              Turn right <span class="key" v-html="getKeyName(keyNameEnum.Player1Right)"></span>
            </div>
          </div>
          <div>
            <h3>Player 2</h3>

            <div class="key-mapping">
              Fire <span class="key" v-html="getKeyName(keyNameEnum.Player2Fire)"></span>
            </div>
            <div class="key-mapping">
              Accelerate <span class="key" v-html="getKeyName(keyNameEnum.Player2Thrust)"></span>
            </div>
            <div class="key-mapping">
              Turn left <span class="key" v-html="getKeyName(keyNameEnum.Player2Left)"></span>
            </div>
            <div class="key-mapping">
              Turn right <span class="key" v-html="getKeyName(keyNameEnum.Player2Right)"></span>
            </div>
          </div>
        </div>

        <h2>Credit</h2>

        <p>Credit goes to Cinematronics for making the original game and inspiring me to bring it to the modern web.
          Credit for all sound effects goes to
          <a href="https://freesound.org/people/LittleRobotSoundFactory/" target="_blank">LittleRobotSoundFactory on Freesound</a> </p>
      </div>

      <footer class="footer">
        <p>Made by <a href="https://paulschwoerer.de" target="_blank">Paul Schwörer</a></p>
        <p>Checkout on <a href="https://github.com/paulschwoerer/rip-off-rip-off" target="_blank">Github</a></p>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import Game, { KeyName } from "../game/Game";
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { getKeyName } from "../game/utils/textUtils";

interface PlayerScore {
  player1: number;
  player2: number;
}

@Component({
  name: "Game"
})
class Landing extends Vue {
  game: Game;

  score: PlayerScore = {
    player1: 0,
    player2: 0
  };

  $refs: {
    canvas: HTMLCanvasElement;
  };

  mounted(): void {
    this.game = new Game(this.$refs.canvas);
  }

  beforeDestroy(): void {
    if (this.game) {
      this.game.dispose();
    }
  }

  get keyNameEnum(): typeof KeyName {
    return KeyName;
  }

  getKeyName(name: KeyName): string {
    return getKeyName(name);
  }
}

export default Landing;
</script>

<style lang="scss">
@import "../scss/vars";

$canvasSize: 600px;

.landing {
  min-height: 100vh;

  h1,
  h2 {
    font-family: Games, sans-serif;
    font-weight: 100;
    margin: 0;
    color: $colorRed;
  }

  h2 {
    margin-top: 40px;
  }

  .center {
    color: #000;
    margin: 0 auto;
    width: $canvasSize;

    .headline {
      font-size: 4em;
    }

    canvas {
      padding: 0;
      margin: 0 auto;
      width: $canvasSize;
      height: $canvasSize;
      display: block;
    }

    .about {
      padding: 40px;
      background: #fff;

      .controls {
        display: flex;
        justify-content: space-around;

        h3 {
          text-decoration: underline;
          text-align: center;
        }

        .key-mapping {
          display: flex;
          align-items: center;
          font-weight: bold;
          justify-content: space-between;
          width: 140px;
          margin: 14px 0;

          .key {
            border: 1px solid #000;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #ccc;
            width: 32px;
            height: 32px;
            box-shadow: 2px 2px 2px #000;
            color: #000;
          }
        }
      }
    }

    .footer {
      color: #fff;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
