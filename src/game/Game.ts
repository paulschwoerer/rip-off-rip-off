import GameContext, { GameState, GameStateListener } from '@/game/GameContext';
import Actor from '@/game/actors/Actor';
import Vector2f from '@/game/utils/Vector2f';
import InputHandler, { KeyUpListener } from '@/game/InputHandler';
import CanvasRenderer from '@/game/CanvasRenderer';
import FuelTank from '@/game/actors/FuelTank';
import PlayerController, { PlayerKeyMap } from '@/game/PlayerController';
import EnemyController from '@/game/EnemyController';
import { BoundingBox } from '@/game/utils/mathUtils';
import SimpleText, { TextAlign } from '@/game/ui/SimpleText';
import { getKeyName } from '@/game/utils/textUtils';
import SoundManager, { SoundEffect } from '@/game/SoundManager';

export enum KeyName {
  Player1Thrust = 'ArrowUp',
  Player1Right = 'ArrowRight',
  Player1Left = 'ArrowLeft',
  Player1Fire = 'KeyK',

  Player2Thrust = 'KeyW',
  Player2Right = 'KeyD',
  Player2Left = 'KeyA',
  Player2Fire = 'KeyQ',

  MenuAction1 = 'KeyR',
  MenuAction2 = 'KeyE',
}

export enum CollisionType {
  PLAYER_SHIP,
  ENEMY_SHIP,
  MISSILE
}

export enum PlayerMode {
  TwoPlayer,
  SinglePlayer
}

export enum PlayerId {
  Player1,
  Player2
}

interface PlayerScoreTextElements {
  [PlayerId.Player1] : SimpleText | null,
  [PlayerId.Player2] : SimpleText | null
}

export default class Game implements GameContext, KeyUpListener {
  private static DEBUG = false && process.env.NODE_ENV === 'development';

  private static TIME_BETWEEN_ENEMIES_ONE_PLAYER = 3;
  private static TIME_BETWEEN_ENEMIES_TWO_PLAYER = 1.5;
  private static TARGET_COUNT = 10;
  private static PLAYER_SCORE_PADDING = 20;
  private static PLAYER_SCORE_TEXT_SIZE = 18;

  private timeTillNextEnemy : number = 0;

  private renderer : CanvasRenderer;

  private readonly inputHandler : InputHandler;

  private actors : Actor[] = [];

  private players : PlayerController[] = [];

  private enemies : EnemyController[] = [];

  private textElements : SimpleText[] = [];

  private targetsExtracted = 0;

  private gameStateListeners : GameStateListener[] = [];

  private gameState : GameState = GameState.Menu;

  private playerMode : PlayerMode = PlayerMode.SinglePlayer;

  private readonly playerScoreTextElements : PlayerScoreTextElements = {
    [PlayerId.Player1]: null,
    [PlayerId.Player2]: null
  };

  constructor(canvas : HTMLCanvasElement) {
    SoundManager.loadSounds();

    this.renderer = new CanvasRenderer(canvas, this);

    // @ts-ignore
    this.inputHandler = new InputHandler(Object.keys(KeyName).map(key => KeyName[key]));

    this.inputHandler.addOnKeyUpListener(this);

    this.showMainMenu();
  }

  showMainMenu() {
    this.setState(GameState.Menu);

    // clear UI
    this.textElements = [];

    const worldCenter = this.getWorldCenter();
    this.textElements.push(new SimpleText(
        'RIP OFF',
        new Vector2f(worldCenter.x, worldCenter.y + 40),
        36,
        TextAlign.Center
    ));
    this.textElements.push(new SimpleText(
        `PRESS ${getKeyName(KeyName.MenuAction1)} FOR 1 PLAYER`,
        new Vector2f(worldCenter.x, worldCenter.y - 40),
        18,
        TextAlign.Center
    ));
    this.textElements.push(new SimpleText(
        `PRESS ${getKeyName(KeyName.MenuAction2)} FOR 2 PLAYERS`,
        new Vector2f(worldCenter.x, worldCenter.y - 80),
        18,
        TextAlign.Center
    ));
  }


  startGame(playerMode : PlayerMode) {
    this.setState(GameState.Playing);

    this.playerMode = playerMode;

    this.targetsExtracted = 0;
    this.timeTillNextEnemy = 0;

    // clear UI
    this.textElements = [];

    const yPosition = this.getWorldDimensions().y - Game.PLAYER_SCORE_PADDING - (2 * Game.PLAYER_SCORE_TEXT_SIZE);

    // Add player score counters
    this.playerScoreTextElements[PlayerId.Player1] =
        new SimpleText('0', new Vector2f(
            Game.PLAYER_SCORE_PADDING,
            yPosition
        ), 18, TextAlign.Left);

    // @ts-ignore
    this.textElements.push(this.playerScoreTextElements[PlayerId.Player1]);

    if (playerMode === PlayerMode.TwoPlayer) {
      this.playerScoreTextElements[PlayerId.Player2] =
          new SimpleText('0', new Vector2f(
              this.getWorldDimensions().x - Game.PLAYER_SCORE_PADDING,
              yPosition
          ), 18, TextAlign.Right);

      // @ts-ignore
      this.textElements.push(this.playerScoreTextElements[PlayerId.Player2]);
    }

    this.players.push(new PlayerController(PlayerId.Player1,
        new PlayerKeyMap(
            KeyName.Player1Thrust,
            KeyName.Player1Right,
            KeyName.Player1Left,
            KeyName.Player1Fire
        ), this
    ));

    if (playerMode === PlayerMode.TwoPlayer) {
      this.players.push(new PlayerController(PlayerId.Player2,
          new PlayerKeyMap(
              KeyName.Player2Thrust,
              KeyName.Player2Right,
              KeyName.Player2Left,
              KeyName.Player2Fire
          ), this
      ));
    }

    const worldCenter = this.getWorldCenter();
    for (let i = 0; i < Game.TARGET_COUNT; i++) {
      this.spawnActor(new FuelTank().setPosition(new Vector2f(
          worldCenter.x + (-40 + Math.random() * 80),
          worldCenter.y + (-40 + Math.random() * 80)
      )).setRotation(Math.random() * 360));
    }
  }

  addGameStateListener(listener : GameStateListener) : this {
    if (listener) {
      this.gameStateListeners.push(listener);
    }

    return this;
  }

  removeGameStateListener(listener : GameStateListener) : this {
    const index = this.gameStateListeners.indexOf(listener);

    if (index > -1) {
      this.gameStateListeners.splice(index, 1);
    }

    return this;
  }

  spawnActor(actor : Actor) : Actor {
    if (actor != null) {
      this.actors.push(actor);
    }

    return actor;
  }

  tick(deltaTime : number) : void {
    this.removeDespawnedEntities();

    if (this.timeTillNextEnemy <= 0 && this.gameState === GameState.Playing) {
      this.timeTillNextEnemy =
          this.playerMode === PlayerMode.SinglePlayer ?
              Game.TIME_BETWEEN_ENEMIES_ONE_PLAYER : Game.TIME_BETWEEN_ENEMIES_TWO_PLAYER;

      this.spawnEnemy();
    }

    this.timeTillNextEnemy -= deltaTime;

    for (const player of this.players) {
      player.tick(deltaTime, this, this.inputHandler);
    }

    for (const enemy of this.enemies) {
      enemy.tick(deltaTime, this);
    }

    for (const actor of this.actors) {
      actor.tick(deltaTime, this);
    }
  }

  onKeyUp(key : string) : void {
    switch (key) {
      case KeyName.MenuAction1:
        if (this.gameState === GameState.GameOver) {
          SoundManager.playSound(SoundEffect.MenuNavigation);
          return this.startGame(this.playerMode);
        }

        if (this.gameState === GameState.Menu) {
          SoundManager.playSound(SoundEffect.MenuNavigation);
          return this.startGame(PlayerMode.SinglePlayer);
        }

        break;
      case KeyName.MenuAction2:
        if (this.gameState === GameState.GameOver) {
          SoundManager.playSound(SoundEffect.MenuNavigation);
          return this.showMainMenu();
        }

        if (this.gameState === GameState.Menu) {
          SoundManager.playSound(SoundEffect.MenuNavigation);
          return this.startGame(PlayerMode.TwoPlayer);
        }

        break;
      default:
        break;
    }
  }

  spawnEnemy() {
    this.enemies.push(new EnemyController(this));
  }

  getActors() : Array<Actor> {
    return this.actors;
  }

  private removeDespawnedEntities() {
    for (let i = this.actors.length - 1; i >= 0; i--) {
      if (this.actors[i].getWillDespawn()) {
        this.actors[i].dispose();
        this.actors.splice(i, 1);
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].getWillDespawn()) {
        this.enemies[i].dispose();
        this.enemies.splice(i, 1);
      }
    }
  }

  dispose() {
    this.inputHandler.removeOnKeyUpListener(this);

    for (const playerController of this.players) {
      playerController.dispose();
    }

    for (const enemyController of this.enemies) {
      enemyController.dispose();
    }

    for (const actor of this.actors) {
      actor.dispose();
    }

    this.renderer.dispose();
  }

  onEnemyExtraction() : void {
    this.targetsExtracted++;

    if (this.targetsExtracted >= Game.TARGET_COUNT) {
      this.handleGameOver();
    }
  }

  getWorldDimensions() : Vector2f {
    return this.renderer.getCanvasDimensions();
  }

  getWorldCenter() : Vector2f {
    const dim = this.getWorldDimensions();

    return new Vector2f(dim.x / 2, dim.y / 2);
  }

  getWorldBounds() : BoundingBox {
    const dimensions = this.getWorldDimensions();

    return {
      minX: 0,
      minY: 0,
      maxX: dimensions.x,
      maxY: dimensions.y
    };
  }

  getTextElements() : SimpleText[] {
    return this.textElements;
  }

  getGameState() : GameState {
    return this.gameState;
  }

  private setState(newState : GameState) : void {
    const oldState = this.gameState;
    this.gameState = newState;

    if (this.isDebugging()) {
      console.log(`State change from ${oldState} to ${newState}`);
    }

    for (const listener of this.gameStateListeners) {
      if (listener) {
        listener.onStateChange(newState, oldState);
      }
    }
  }

  private handleGameOver() {
    this.setState(GameState.GameOver);

    for (const enemy of this.enemies) {
      enemy.despawn();
    }

    this.despawnAllActors();

    this.removePlayers();

    this.showGameOverScreen();
  }

  private removePlayers() {
    for (const player of this.players) {
      player.dispose();
    }

    this.players = [];
  }

  private despawnAllActors() {
    for (const actor of this.actors) {
      actor.despawn();
    }
  }

  private showGameOverScreen() {
    const worldCenter = this.getWorldCenter();
    this.textElements.push(new SimpleText('GAME OVER', worldCenter, 36, TextAlign.Center));
    this.textElements.push(new SimpleText(
        `PRESS ${getKeyName(KeyName.MenuAction1)} TO RESTART`,
        new Vector2f(worldCenter.x, worldCenter.y - 40),
        18, TextAlign.Center
    ));
    this.textElements.push(new SimpleText(
        `PRESS ${getKeyName(KeyName.MenuAction2)} FOR MAIN MENU`,
        new Vector2f(worldCenter.x, worldCenter.y - 80),
        18, TextAlign.Center
    ));
  }

  isDebugging() : boolean {
    return Game.DEBUG;
  }

  addDebugOutput(vertices : number[]) : void {
    this.renderer.addDebugPolygon(vertices);
  }

  onPlayerScoreUpdate(player : PlayerController) : void {
    const id = player.getId();

    if (this.playerScoreTextElements[id] !== null) {
      // @ts-ignore
      this.playerScoreTextElements[id].setText(player.getScore().toString());
    }
  }
}