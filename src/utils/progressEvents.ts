
// Progressive events to track generation progress

/**
 * Emits a progress update event for a specific unit
 */
export const emitProgress = (unitIndex: number, progress: number) => {
  console.log(`Emitting progress event: Unit ${unitIndex} at ${progress}%`);
  const event = new CustomEvent('moduleProgress', {
    detail: { unitIndex, progress }
  });
  document.dispatchEvent(event);
};

/**
 * Emits an event when a module is completed
 */
export const emitModuleDone = (unitIndex: number) => {
  console.log(`Emitting module done event: Unit ${unitIndex}`);
  const event = new CustomEvent('moduleDone', {
    detail: { unitIndex }
  });
  document.dispatchEvent(event);
};

/**
 * Register a function to be called on progress updates
 */
export const onProgressUpdate = (callback: (unitIndex: number, progress: number) => void) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail.unitIndex, customEvent.detail.progress);
  };
  document.addEventListener('moduleProgress', handler);
  return () => document.removeEventListener('moduleProgress', handler);
};

/**
 * Register a function to be called when a module is done
 */
export const onModuleDone = (callback: (unitIndex: number) => void) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail.unitIndex);
  };
  document.addEventListener('moduleDone', handler);
  return () => document.removeEventListener('moduleDone', handler);
};
