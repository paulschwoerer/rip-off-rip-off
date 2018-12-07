import Actor from '@/game/actors/Actor';
import Vector2f from '@/game/utils/Vector2f';
import { BoundingBox } from '@/game/utils/mathUtils';
import PlayerController from '@/game/PlayerController';
import SimpleText from '@/game/ui/SimpleText';
import Color from '@/game/utils/Color';

export enum GameState {
  Menu,
  Playing,
  GameOver
}

export interface GameStateListener {
  onStateChange(newState : GameState, oldState : GameState) : void;
}

export default interface GameContext {
  getActors() : Array<Actor>;

  spawnActor(actor : Actor) : Actor;

  getWorldDimensions() : Vector2f;

  getWorldCenter() : Vector2f;

  getWorldBounds() : BoundingBox;

  tick(deltaTime : number) : void;

  onEnemyExtraction() : void;

  addGameStateListener(listener : GameStateListener) : this;

  removeGameStateListener(listener : GameStateListener) : this;

  getTextElements() : SimpleText[];

  getGameState() : GameState;

  isDebugging() : boolean;

  addDebugOutput(vertices : number[]) : void;

  onPlayerScoreUpdate(player : PlayerController) : void;
}