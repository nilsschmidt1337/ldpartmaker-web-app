import {Context, EventProvider, Invalidate, Renderer} from "webgl-operate";

export class AppRenderer extends Renderer {

  uninitialize() {
    super.uninitialize();
    console.log("uninitialized resources of the AppRenderer")
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
    console.log("renderer is uninitialized")
  }

  protected onUpdate(): boolean {
    return false;
  }
}
