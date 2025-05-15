
/// <reference types="vite/client" />

declare module '@bpmn-io/form-js-editor' {
  export class FormEditor {
    constructor(options: { container: HTMLElement });
    importSchema(schema: any): Promise<void>;
    getSchema(): any;
    on(event: string, callback: Function): void;
    destroy(): void;
  }
}

declare module '@bpmn-io/form-js-viewer' {
  export class Form {
    constructor(options: { container: HTMLElement });
    importSchema(schema: any): Promise<void>;
    on(event: string, callback: Function): void;
    destroy(): void;
  }
}
