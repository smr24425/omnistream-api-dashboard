export type RenderCallback = (deltaTime: number, timestamp: number) => void;

class RenderLoop {
  private callbacks: Set<RenderCallback> = new Set();
  private lastTimestamp: number = 0;
  private isRunning: boolean = false;
  private rafId: number | null = null;

  constructor() {
    this.loop = this.loop.bind(this);
  }

  public register(callback: RenderCallback): () => void {
    this.callbacks.add(callback);
    return () => this.unregister(callback);
  }

  public unregister(callback: RenderCallback): void {
    this.callbacks.delete(callback);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private loop(timestamp: number): void {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.callbacks.forEach((callback) => {
      try {
        callback(deltaTime, timestamp);
      } catch (error) {
        console.error("Error in render callback:", error);
      }
    });

    this.rafId = requestAnimationFrame(this.loop);
  }
}

export const renderLoop = new RenderLoop();
