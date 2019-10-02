import {
  createRenderTarget,
  createProgram,
  resizeCanvasToDisplaySize,
  RenderTarget
} from '@/game/utils/glUtils';
// @ts-ignore
import bloomFragmentSource from '@/game/shaders/bloomFragment.glsl';
// @ts-ignore
import brightnessFragmentSource from '@/game/shaders/brightnessFragment.glsl';
// @ts-ignore
import blendingFragmentSource from '@/game/shaders/blendingFragment.glsl';
// @ts-ignore
import postVertexSource from '@/game/shaders/postVertex.glsl';
// @ts-ignore
import actorFragmentSource from '@/game/shaders/actorFragment.glsl';
// @ts-ignore
import textVertexSource from '@/game/shaders/textVertex.glsl';
// @ts-ignore
import textFragmentSource from '@/game/shaders/textFragment.glsl';
// @ts-ignore
import actorVertexSource from '@/game/shaders/actorVertex.glsl';
// @ts-ignore
import debugVertexSource from '@/game/shaders/debugVertex.glsl';
// @ts-ignore
import debugFragmentSource from '@/game/shaders/debugFragment.glsl';
import Vector2f from '@/game/utils/Vector2f';
import { degToRad, getRectangleVertices } from '@/game/utils/mathUtils';
import GameContext from '@/game/GameContext';

enum UniformTypes {
  INTEGER,
  FLOAT,
  FLOAT_ARRAY
}

interface ActorParameterLocations {
  color : WebGLUniformLocation | null;
  position : number;
  scale : WebGLUniformLocation | null;
  resolution : WebGLUniformLocation | null;
  rotation : WebGLUniformLocation | null;
  translation : WebGLUniformLocation | null;
}

interface Programs {
  readonly actor : WebGLProgram | null;
  readonly text : WebGLProgram | null;
  readonly bloom : WebGLProgram | null;
  readonly blend : WebGLProgram | null;
  readonly brightness : WebGLProgram | null;
  readonly debug : WebGLProgram | null;
}

export default class CanvasRenderer {
  private animFrameHandle : number;

  private readonly gl : WebGLRenderingContext;

  private lastRender : number = 0;

  private readonly programs : Programs;

  private readonly postRenderTargets : Array<RenderTarget>;
  private readonly sceneRenderTarget : RenderTarget;

  private renderTargetIndex : number = 0;

  private context : GameContext;

  private readonly actorParameterLocations : ActorParameterLocations | null = null;

  private readonly debugPolygons : number[][] = [];

  constructor(canvas : HTMLCanvasElement, context : GameContext) {
    const gl = <WebGLRenderingContext>canvas.getContext('webgl2');

    this.context = context;

    resizeCanvasToDisplaySize(<HTMLCanvasElement>gl.canvas);

    this.programs = {
      bloom: createProgram(gl, postVertexSource, bloomFragmentSource),
      actor: createProgram(gl, actorVertexSource, actorFragmentSource),
      text: createProgram(gl, textVertexSource, textFragmentSource),
      brightness: createProgram(gl, postVertexSource, brightnessFragmentSource),
      blend: createProgram(gl, postVertexSource, blendingFragmentSource),
      debug: createProgram(gl, debugVertexSource, debugFragmentSource)
    };

    const renderTargetSize = new Vector2f(canvas.width, canvas.height);

    this.sceneRenderTarget = createRenderTarget(gl, renderTargetSize);

    this.postRenderTargets = [
      createRenderTarget(gl, renderTargetSize),
      createRenderTarget(gl, renderTargetSize)
    ];

    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    //gl.enable(gl.BLEND);
    //gl.disable(gl.DEPTH_TEST); // TODO: needed?

    this.gl = gl;

    this.animFrameHandle = requestAnimationFrame(this.render.bind(this));

    if (this.programs.actor !== null) {
      this.actorParameterLocations = {
        position: gl.getAttribLocation(this.programs.actor, 'a_position'),
        resolution: gl.getUniformLocation(this.programs.actor, 'u_resolution'),
        translation: gl.getUniformLocation(this.programs.actor, 'u_translation'),
        rotation: gl.getUniformLocation(this.programs.actor, 'u_rotation'),
        scale: gl.getUniformLocation(this.programs.actor, 'u_scale'),
        color: gl.getUniformLocation(this.programs.actor, 'u_color')
      };
    }
  }

  render(timeStamp : DOMHighResTimeStamp) : void {
    const deltaTime =
        (this.lastRender ? timeStamp - this.lastRender : 0) / 1000;
    this.lastRender = timeStamp;

    const gl = this.gl;

    resizeCanvasToDisplaySize(<HTMLCanvasElement>gl.canvas);

    this.context.tick(deltaTime);

    // Start rendering to RenderTarget
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneRenderTarget.buffer);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneRenderTarget.texture);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.renderActors(gl);

    this.renderUI(gl);

    // Finish rendering to RenderTarget, save to texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.postRender(gl);

    this.renderToScreen(gl);

    this.animFrameHandle = requestAnimationFrame(this.render.bind(this));
  }

  renderActors(gl : WebGLRenderingContext) : void {
    if (this.programs.actor === null || this.actorParameterLocations === null) {
      console.warn('Actor Program or parameters is NULL');
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.useProgram(this.programs.actor);

    gl.enableVertexAttribArray(this.actorParameterLocations.position);

    gl.vertexAttribPointer(
        this.actorParameterLocations.position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform2f(
        this.actorParameterLocations.resolution,
        gl.canvas.width,
        gl.canvas.height
    );

    for (const actor of this.context.getActors().sort((a, b) => a.getZIndex() - b.getZIndex())) {
      const color = actor.getColor();

      for (const component of actor.getComponents()) {
        const geometry = new Float32Array(component.getLocalGeometry());

        gl.bufferData(gl.ARRAY_BUFFER, geometry, gl.STATIC_DRAW);

        gl.uniform2fv(
            this.actorParameterLocations.translation,
            [component.getWorldPosition().x,
              component.getWorldPosition().y]
        );

        gl.uniform2fv(
            this.actorParameterLocations.scale,
            [component.getWorldScale().x,
              component.getWorldScale().y]
        );

        gl.uniform4fv(
            this.actorParameterLocations.color,
            color.toArray()
        );

        const rad = degToRad(component.getWorldRotation());
        gl.uniform2f(this.actorParameterLocations.rotation, Math.sin(rad), Math.cos(rad));

        gl.drawArrays(gl.LINE_LOOP, 0, geometry.length / 2);
      }
    }
  }

  renderUI(gl : WebGLRenderingContext) : void {
    if (this.programs.text === null) {
      console.warn('SimpleText Program is NULL');
      return;
    }

    gl.useProgram(this.programs.text);

    const positionLocation = gl.getAttribLocation(this.programs.text, 'a_position');
    const resolutionLocation = gl.getUniformLocation(this.programs.text, 'u_resolution');
    const colorLocation = gl.getUniformLocation(this.programs.text, 'u_color');
    const translationLocation = gl.getUniformLocation(this.programs.text, 'u_translation');
    const sizeLocation = gl.getUniformLocation(this.programs.text, 'u_size');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform2f(
        resolutionLocation,
        gl.canvas.width,
        gl.canvas.height
    );

    for (const text of this.context.getTextElements()) {
      gl.uniform1f(sizeLocation, text.getSize());

      gl.uniform4fv(colorLocation, text.getColor().toArray());

      const chars = text.getCharacters();
      const pos = text.getPosition();

      for (const char of chars) {
        const vertices = new Float32Array(char.getVertices());

        if (vertices.length) {
          gl.uniform2f(translationLocation, pos.x + char.getOffset(), pos.y);

          gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

          gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);
        }
      }
    }
  }

  postRender(gl : WebGLRenderingContext) : void {
    this.renderPass(gl, this.programs.brightness, this.sceneRenderTarget, this.postRenderTargets[this.renderTargetIndex]);

    for (let i = 0; i < 3; i++) {
      const sourceIndex = this.renderTargetIndex;
      this.nextPostRenderTarget();

      this.renderPass(
          gl,
          this.programs.bloom,
          this.postRenderTargets[sourceIndex],
          this.postRenderTargets[this.renderTargetIndex],
          [{
            type: UniformTypes.INTEGER,
            name: 'u_horizontal',
            value: i % 2
          }, {
            type: UniformTypes.FLOAT_ARRAY,
            name: 'u_weight',
            value: [0.227027, 0.1945946, 0.2216216, 0.054054, 0.016216]
          }]
      );
    }
  }

  renderPass(
      gl : WebGLRenderingContext,
      program : WebGLProgram | null,
      source : RenderTarget,
      destination : RenderTarget,
      additionalUniforms : Array<any> = []
  ) : void {
    if (program == null) {
      console.warn('Post-process program is NULL');
      return;
    }

    gl.useProgram(program);

    const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');

    // additional uniforms
    additionalUniforms.forEach(a => {
      const location = gl.getUniformLocation(program, a.name);

      switch (a.type) {
        case UniformTypes.INTEGER:
          gl.uniform1i(location, a.value);
          break;
        case UniformTypes.FLOAT:
          gl.uniform1f(location, a.value);
          break;
        case UniformTypes.FLOAT_ARRAY:
          gl.uniform1fv(location, a.value);
          break;
      }
    });


    gl.bindFramebuffer(gl.FRAMEBUFFER, destination.buffer);
    gl.bindTexture(gl.TEXTURE_2D, destination.texture);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleVertices(0, 0, 1, 1)), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordAttributeLocation);
    gl.vertexAttribPointer(
        texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source.texture);
    gl.uniform1i(textureLocation, 0);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleVertices(-1, -1, 2, 2)), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  renderDebug(gl : WebGLRenderingContext) : void {
    if (this.programs.debug == null) {
      console.warn('Debug program is NULL');
      return;
    }

    gl.useProgram(this.programs.debug);

    const resolutionLocation = gl.getUniformLocation(this.programs.debug, 'u_resolution');

    gl.uniform2f(
        resolutionLocation,
        gl.canvas.width,
        gl.canvas.height
    );

    for (const polygon of this.debugPolygons) {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(polygon), gl.STATIC_DRAW);
      gl.drawArrays(gl.LINE_LOOP, 0, polygon.length / 2);
    }

    // empty for next frame
    this.debugPolygons.splice(0, this.debugPolygons.length);
  }

  renderToScreen(gl : WebGLRenderingContext) : void {
    if (this.programs.blend == null) {
      console.warn('Blending Program is NULL');
      return;
    }

    gl.useProgram(this.programs.blend);

    const texCoordAttributeLocation = gl.getAttribLocation(this.programs.blend, 'a_texCoord');
    const sceneLocation = gl.getUniformLocation(this.programs.blend, 'u_scene');
    const blurLocation = gl.getUniformLocation(this.programs.blend, 'u_blur');

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleVertices(0, 0, 1, 1)), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(texCoordAttributeLocation);
    gl.vertexAttribPointer(
        texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneRenderTarget.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.postRenderTargets[this.renderTargetIndex].texture);

    gl.uniform1i(sceneLocation, 0);
    gl.uniform1i(blurLocation, 1);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getRectangleVertices(-1, -1, 2, 2)), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (this.context.isDebugging()) {
      this.renderDebug(gl);
    }
  }

  nextPostRenderTarget() {
    this.renderTargetIndex = (this.renderTargetIndex + 1) % this.postRenderTargets.length;
  }

  dispose() : void {
    cancelAnimationFrame(this.animFrameHandle);
  }

  getCanvasDimensions() : Vector2f {
    const { width, height } = this.gl.canvas;
    return new Vector2f(width, height);
  }

  addDebugPolygon(polygon : number[]) {
    this.debugPolygons.push(polygon);
  }
}