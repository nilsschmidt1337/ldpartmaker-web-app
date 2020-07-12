import {Context, EventProvider, Invalidate, Renderer} from 'webgl-operate';

export class WebglRenderer extends Renderer {

  uninitialize() {
    super.uninitialize();
    console.log('uninitialized resources of the WebglRenderer');
  }

  protected onDiscarded(): void {
  }

  protected onFrame(frameNumber: number): void {
  }

  protected onInitialize(context: Context, callback: Invalidate, eventProvider: EventProvider): boolean {
    return true;
  }

  protected onPrepare(): void {
  }

  protected onUninitialize(): void {
    console.log('renderer is uninitialized');
  }

  protected onUpdate(): boolean {
    return false;
  }
}
