import { DocumentRegistry } from '@jupyterlab/docregistry';

import { MapChange, YDocument } from '@jupyterlab/shared-models';

import { IModelDB, ModelDB } from '@jupyterlab/observables';

import { IChangedArgs } from '@jupyterlab/coreutils';

import { PartialJSONObject } from '@lumino/coreutils';

import { ISignal, Signal } from '@lumino/signaling';

import * as Y from 'yjs';

//TODO
// import { CommentfilePosition, CommentfileSharedObject } from './CommentfileModel';



export type TextfileSharedObject = {
  x: number;
  y: number;
  content: string;
};

export type TextfilePosition = {
  x: number;
  y: number;
};

export class TextfileModel implements DocumentRegistry.IModel {

  constructor(languagePreference?: string, modelDB?: IModelDB) {
    this.modelDB = modelDB || new ModelDB();

    // Listening for changes on the shared model to propagate them
    this.sharedModel.awareness.on('change', this._onClientChanged);
    this.sharedModel.changed.connect(this._onSharedModelChanged);
  }

  get dirty(): boolean {
    return this._dirty;
  }
  set dirty(value: boolean) {
    this._dirty = value;
  }
  get editing(): boolean {
    return this._editing;
  }
  set editing(value: boolean) {
    this._editing = value;
  }
  get readOnly(): boolean {
    return this._readOnly;
  }
  set readOnly(value: boolean) {
    this._readOnly = value;
  }
  get isDisposed(): boolean {
    return this._isDisposed;
  }
  get contentChanged(): ISignal<this, void> {
    return this._contentChanged;
  }
  get stateChanged(): ISignal<this, IChangedArgs<any, any, string>> {
    return this._stateChanged;
  }
  get sharedModelChanged(): ISignal<this, TextfileChange> {
    return this._sharedModelChanged;
  }
  get clientChanged(): ISignal<this, Map<number, any>> {
    return this._clientChanged;
  }

  readonly defaultKernelName: string ='' ;
  readonly defaultKernelLanguage: string ='';
  readonly modelDB: IModelDB;
  readonly sharedModel: Textfile = Textfile.create();

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    Signal.clearData(this);
  }

  toString(): string {
    const pos = this.sharedModel.getContent('position');
    const obj = {
      x: pos?.x || 10,
      y: pos?.y || 10,
      content: this.sharedModel.getContent('content') || ''
    };
    return JSON.stringify(obj, null, 2);
  }

  /**
   * The context will call this method when loading data from disk.
   * This method should implement the logic to parse the data and store it
   * on the datastore.
   */
  fromString(data: string): void {
    const obj = JSON.parse(data);
    this.sharedModel.transact(() => {
      this.sharedModel.setContent('position', { x: obj.x, y: obj.y });
      this.sharedModel.setContent('content', obj.content);
    });
  }

  /**
   * Should return the data that you need to store in disk as a JSON object.
   * The context will call this method to get the file's content and save it
   * to disk.
   *
   * NOTE: This method is only used by the context of the notebook, every other
   * document will load/save the data through toString/fromString.
   */
  toJSON(): PartialJSONObject {
    const pos = this.sharedModel.getContent('position');
    const obj = {
      x: pos?.x || 10,
      y: pos?.y || 10,
      content: this.sharedModel.getContent('content') || ''
    };
    return obj;
  }

  /**
   * The context will call this method when loading data from disk.
   * This method should implement the logic to parse the data and store it
   * on the datastore.
   *
   * NOTE: This method is only used by the context of the notebook, every other
   * document will load/save the data through toString/fromString.
   */
  fromJSON(data: PartialJSONObject): void {
    this.sharedModel.transact(() => {
      this.sharedModel.setContent('position', { x: data.x, y: data.y });
      this.sharedModel.setContent('content', data.content);
    });
  }

  /**
   *
   */
  initialize(): void {
    // not implemented
  }
  getSharedObject(): TextfileSharedObject {
    const pos = this.sharedModel.getContent('position');
    const obj = {
      x: pos?.x || 10,
      y: pos?.y || 10,
      content: this.sharedModel.getContent('content') || ''
    };
    return obj;
  }
  setPosition(pos: TextfilePosition): void {
    this.sharedModel.setContent('position', pos);
  }
  setContent(content: string): void {
    this.sharedModel.setContent('content', content);
  }
  setClient(pos: TextfilePosition): void {
    // Adds the position of the mouse from the client to the shared state.
    this.sharedModel.awareness.setLocalStateField('mouse', pos);
  }

  /**
   * Callback to listen for changes on the sharedModel. This callback listens
   * to changes on shared model's content and propagates them to the DocumentWidget.
   *
   * @param sender: The sharedModel that triggers the changes.
   *
   * @param change: The changes on the sharedModel.
   */
  private _onSharedModelChanged = (
    sender: Textfile,
    changes: TextfileChange 
  ): void => {
    this._sharedModelChanged.emit(changes);
  };

  /**
   * Callback to listen for changes on the sharedModel. This callback listens
   * to changes on the different clients sharing the document and propagates
   * them to the DocumentWidget.
   *
   * @param sender: The sharedModel that triggers the changes.
   *
   * @param clients: The list of client's states.
   */
  private _onClientChanged = () => {
    const clients = this.sharedModel.awareness.getStates();
    this._clientChanged.emit(clients);
  };

  private _dirty = false;
  private _editing = false;
  private _readOnly = false;
  private _isDisposed = false;
  private _contentChanged = new Signal<this, void>(this);
  private _stateChanged = new Signal<this, IChangedArgs<any>>(this);
  private _clientChanged = new Signal<this, Map<number, any>>(this);
  private _sharedModelChanged = new Signal<this, TextfileChange>(this);
}

/**
 * Type representing the changes on the sharedModel.
 *
 * NOTE: Yjs automatically syncs the documents of the different clients
 * and triggers an event to notify that the content changed. You can
 * listen to this changes and propagate them to the widget so you don't
 * need to update all the data in the widget, you can only update the data
 * that changed.
 *
 * This type represents the different changes that may happen and ready to use
 * for the widget.
 */
export type TextfileChange = {
  contextChange?: MapChange;
  contentChange?: string;
  positionChange?: TextfilePosition;
};

/**
 * SharedModel, stores and shares the content between clients.
 */
export class Textfile extends YDocument<TextfileChange> {
  constructor() {
    super();
    // Creating a new shared object and listen to its changes
    this._content = this.ydoc.getMap('content');
    this._content.observe(this._contentObserver);
    // try deep.observe then check the console log 
  }

  /**
   * Dispose of the resources.
   */
  dispose(): void {
    this._content.unobserve(this._contentObserver);
  }

  /**
   * Static method to create instances on the sharedModel
   */
  public static create(): Textfile{
    return new Textfile();
  }

  /**
   * Returns an the requested object.
   *
   * @param key: The key of the object.
   */
  public getContent(key: string): any {
    return this._content.get(key);
  }

  /**
   * Adds new data.
   *
   * @param key: The key of the object.
   * @param value: New object.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public setContent(key: string, value: any): void {
    this._content.set(key, value);
  }

  /**
   * Handle a change.
   *
   * @param event
   */
  private _contentObserver = (event: Y.YMapEvent<any>): void => {
    const changes: TextfileChange= {};

    // Checks which object changed and propagates them.
    if (event.keysChanged.has('position')) {
      changes.positionChange = this._content.get('position');
    }

    if (event.keysChanged.has('content')) {
      changes.contentChange = this._content.get('content');
    }
    console.log(changes);

    this._changed.emit(changes);
  };

  private _content: Y.Map<any>;
}
