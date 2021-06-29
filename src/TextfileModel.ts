import { DocumentModel } from '@jupyterlab/docregistry';
import { IModelDB, IObservableString } from '@jupyterlab/observables';
// import { FileChange, ISharedFile } from '@jupyterlab/shared-models';
// import { ISignal } from '@lumino/signaling';
// import { CommentfileModel } from './CommentfileModel';
import { ISignal, Signal } from '@lumino/signaling';


export type TextfileSharedObject = {
  x: number;
  y: number;
  content: string;
};

export type TextfilePosition = {
  x: number;
  y: number;
};

// Figure out a way to do it with extends for ease
export class TextfileModel extends DocumentModel{
  constructor(storeObject ?: IObservableString, MySignal ?: ISignal<TextfileModel, void>, languagePreference?: string, modelDB?: IModelDB) {
    super(languagePreference)
    // this.contentChanged.connect(storeObject);
    // this._valueChanged.emit(void 0)
    // this._valueChanged = this.contentChanged
    MySignal = this._valueChanged;
    storeObject = this._storeObject;
  }
  protected triggerContentChange(): void {
    this._valueChanged.emit(void 0);
    this._storeObject = this.value
    console.log(this.value)
  }
  private _valueChanged = new Signal<this, void>(this);
  private _storeObject: IObservableString | undefined; 
}


// export class TextfileModel implements DocumentRegistry.IModel {
//   constructor(languagePreference?: string, modelDB?: IModelDB) {
//     this.modelDB = modelDB || new ModelDB();
//     // Listening for changes on the shared model to propagate them
//     // this.sharedModel.awareness.on('change', this._onClientChanged);
//     // this.sharedModel.changed.connect(this._onSharedModelChanged);
//   }

//   get dirty(): boolean {
//     return this._dirty;
//   }
//   set dirty(value: boolean) {
//     this._dirty = value;
//   }
//   get editing(): boolean {
//     return this._editing;
//   }
//   set editing(value: boolean) {
//     this._editing = value;
//   }
//   get readOnly(): boolean {
//     return this._readOnly;
//   }
//   set readOnly(value: boolean) {
//     this._readOnly = value;
//   }
//   get isDisposed(): boolean {
//     return this._isDisposed;
//   }
//   get contentChanged(): ISignal<this, void> {
//     return this._contentChanged;
//   }
//   get stateChanged(): ISignal<this, IChangedArgs<any, any, string>> {
//     return this._stateChanged;
//   }
//   get sharedModelChanged(): ISignal<this, TextfileChange> {
//     return this._sharedModelChanged;
//   }
//   get clientChanged(): ISignal<this, Map<number, any>> {
//     return this._clientChanged;
//   }

//   readonly defaultKernelName: string ='' ;
//   readonly defaultKernelLanguage: string ='';
//   readonly modelDB: IModelDB;
//   // readonly sharedModel: Textfile = Textfile.create();
//   // readonly sharedModel;

//   dispose(): void {
//     if (this._isDisposed) {
//       return;
//     }
//     this._isDisposed = true;
//     Signal.clearData(this);
//   }

//   // toString(): string {
//   //   const pos = this.sharedModel.getContent('position');
//   //   const obj = {
//   //     x: pos?.x || 10,
//   //     y: pos?.y || 10,
//   //     content: this.sharedModel.getContent('content') || ''
//   //   };
//   //   return JSON.stringify(obj, null, 2);
//   // }
//   // fromString(data: string): void {
//   //   const obj = JSON.parse(data);
//   //   this.sharedModel.transact(() => {
//   //     this.sharedModel.setContent('position', { x: obj.x, y: obj.y });
//   //     this.sharedModel.setContent('content', obj.content);
//   //   });
//   // }
//   // toJSON(): PartialJSONObject {
//   //   const pos = this.sharedModel.getContent('position');
//   //   const obj = {
//   //     x: pos?.x || 10,
//   //     y: pos?.y || 10,
//   //     content: this.sharedModel.getContent('content') || ''
//   //   };
//   //   return obj;
//   // }
//   // fromJSON(data: PartialJSONObject): void {
//   //   this.sharedModel.transact(() => {
//   //     this.sharedModel.setContent('position', { x: data.x, y: data.y });
//   //     this.sharedModel.setContent('content', data.content);
//   //   });
//   // }
//   // initialize(): void {
//   //   // not implemented
//   // }
//   // getSharedObject(): TextfileSharedObject {
//   //   const pos = this.sharedModel.getContent('position');
//   //   const obj = {
//   //     x: pos?.x || 10,
//   //     y: pos?.y || 10,
//   //     content: this.sharedModel.getContent('content') || ''
//   //   };
//   //   return obj;
//   // }
//   // setPosition(pos: TextfilePosition): void {
//   //   this.sharedModel.setContent('position', pos);
//   // }
//   // setContent(content: string): void {
//   //   this.sharedModel.setContent('content', content);
//   // }
//   // setClient(pos: TextfilePosition): void {
//   //   // Adds the position of the mouse from the client to the shared state.
//   //   this.sharedModel.awareness.setLocalStateField('mouse', pos);
//   // }
//   // private _onSharedModelChanged = (
//   //   sender: Textfile,
//   //   changes: TextfileChange 
//   // ): void => {
//   //   this._sharedModelChanged.emit(changes);
//   // };
//   // private _onClientChanged = () => {
//   //   const clients = this.sharedModel.awareness.getStates();
//   //   this._clientChanged.emit(clients);
//   // };

//   private _dirty = false;
//   private _editing = false;
//   private _readOnly = false;
//   private _isDisposed = false;
//   private _contentChanged = new Signal<this, void>(this);
//   private _stateChanged = new Signal<this, IChangedArgs<any>>(this);
//   private _clientChanged = new Signal<this, Map<number, any>>(this);
//   private _sharedModelChanged = new Signal<this, TextfileChange>(this);
// }

// export type TextfileChange = {
//   contextChange?: MapChange;
//   contentChange?: string;
//   positionChange?: TextfilePosition;
// };

// export class Textfile extends YDocument<TextfileChange> {
//   constructor() {
//     super();
//     // Creating a new shared object and listen to its changes
//     this._content = this.ydoc.getMap('content');
//     this._content.observe(this._contentObserver);
//     // try deep.observe then check the console log 
//   }

//   dispose(): void {
//     this._content.unobserve(this._contentObserver);
//   }
//   public static create(): Textfile{
//     return new Textfile();
//   }
//   public getContent(key: string): any {
//     return this._content.get(key);
//   }
//   // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
//   public setContent(key: string, value: any): void {
//     this._content.set(key, value);
//   }
//   private _contentObserver = (event: Y.YMapEvent<any>): void => {
//     const changes: TextfileChange= {};

//     // Checks which object changed and propagates them.
//     if (event.keysChanged.has('position')) {
//       changes.positionChange = this._content.get('position');
//     }
//     if (event.keysChanged.has('content')) {
//       changes.contentChange = this._content.get('content');
//     }
//     this._changed.emit(changes);
//   };
//   private _content: Y.Map<any>;
// }
