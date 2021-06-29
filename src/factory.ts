import { InputArea } from '@jupyterlab/cells';
import {  CodeEditorWrapper } from '@jupyterlab/codeeditor';
import { ABCWidgetFactory, DocumentRegistry, TextModelFactory, } from '@jupyterlab/docregistry';

import { IModelDB, IObservableString } from '@jupyterlab/observables';

import { Contents } from '@jupyterlab/services';
import { UUID } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
import { CommentfileModel } from './CommentfileModel';

import { TextfileModel } from './TextfileModel';

import { CommentfileWidget, TextfileWidget } from './widget';
// import { CommentfilePanel, CommentfileWidget } from './widget';
import * as models from '@jupyterlab/shared-models';

// let GmodelDB = new ModelDB();

// let storeObject = new Signal(this);
// let storeObject = { 'value' : "" };
let storeObject : IObservableString;
// let MySignal = new Signal<ISharedFile, FileChange>(this);
let MySignal = new Signal<any,any>(this);

const Myfilemodel = new models.YFile() as models.ISharedFile;


// export class CommentfileModelFactory
//   implements DocumentRegistry.IModelFactory<CommentfileModel>
// {
//   get name(): string {
//     return 'comment-model';
//   }
//   get contentType(): Contents.ContentType {
//     return 'file';
//   }
//   get fileFormat(): Contents.FileFormat {
//     return 'text';
//   }
//   get isDisposed(): boolean {
//     return this._disposed;
//   }

//   dispose(): void {
//     this._disposed = true;
//   }
//   preferredLanguage(path: string): string {
//     return '';
//   }
//   createNew(languagePreference?: string, modelDB?: IModelDB): CommentfileModel {
//     // return new CommentfileModel(languagePreference, modelDB);
//     return new CommentfileModel(languagePreference, modelDB, MySignal);
//   }

//   private _disposed = false;
// }

// export class TextfileModelFactory
//   implements DocumentRegistry.IModelFactory<TextfileModel>
// {
//   get name(): string {
//     return 'textfile-model';
//   }
//   get contentType(): Contents.ContentType {
//     return 'file';
//   }
//   get fileFormat(): Contents.FileFormat {
//     return 'text';
//   }
//   get isDisposed(): boolean {
//     return this._disposed;
//   }

//   dispose(): void {
//     this._disposed = true;
//   }
//   preferredLanguage(path: string): string {
//     return '';
//   }
//   createNew(languagePreference?: string, modelDB?: IModelDB): TextfileModel {
//     return new TextfileModel(languagePreference, GmodelDB);
//   }
//   private _disposed = false;
// }

export class CommentfileModelFactory extends TextModelFactory {
  get name(): string{
    return 'comment-model';
  }
  get contentType(): Contents.ContentType {
    return 'file';
  }
  get fileFormat(): Contents.FileFormat{
    return 'text'
  }
  get isDisposed(): boolean{
    return this.isDisposed;
  }
  dispose(): void {
    // this.isDisposed = true;
  }
  preferredLanguage(path: string): string {
    return '';
  }
  createNew(languagePreference?: string, modelDB?: IModelDB): CommentfileModel{
    return new CommentfileModel(Myfilemodel,storeObject, MySignal, languagePreference, modelDB);
  }
  getStoreObject(): any {
    return storeObject
  }
}

export class TextfileModelFactory extends TextModelFactory {
  get name(): string{
    return 'textfile-model';
  }
  get contentType(): Contents.ContentType {
    return 'file';
  }
  get fileFormat(): Contents.FileFormat{
    return 'text'
  }
  get isDisposed(): boolean{
    return this.isDisposed;
  }
  dispose(): void {
    // this.isDisposed = true;
  }
  preferredLanguage(path: string): string {
    return '';
  }
  createNew(languagePreference?: string, modelDB?: IModelDB): TextfileModel {
    console.log(storeObject)
    return new TextfileModel(Myfilemodel, storeObject, MySignal, languagePreference, modelDB);
  }
}

export class CommentfileWidgetFactory extends ABCWidgetFactory<
  CommentfileWidget,
  CommentfileModel
> {
  constructor(options: DocumentRegistry.IWidgetFactoryOptions) {
    super(options);
  }
  protected createNewWidget(
    context: DocumentRegistry.IContext<CommentfileModel>
  ): CommentfileWidget {
    return new CommentfileWidget({
      context,
      content: new CodeEditorWrapper({
        model: context.model,
        uuid: UUID.uuid4(),
        factory: InputArea.defaultContentFactory.editorFactory,
        updateOnShow: true,
        config: {
          autoClosingBrackets: true,
          codeFolding: true,
          // lineNumbers: true
        }
      })
    });
  }
}

export class TextfileWidgetFactory extends ABCWidgetFactory<
  TextfileWidget,
  TextfileModel
> {
  constructor(options: DocumentRegistry.IWidgetFactoryOptions) {
    super(options);
  }
  protected createNewWidget(
    context: DocumentRegistry.IContext<TextfileModel>
  ): TextfileWidget {
    return new TextfileWidget({
      context,
      // content: new TextfilePanel({
      //   uuid: UUID.uuid4(),
      //   factory: InputArea.defaultContentFactory.editorFactory,
      //   // model: new CodeEditor.Model,
      //   model: context.model,
      // })
      // content: new FileEditor({
      //   context: context,
      //   factory: InputArea.defaultContentFactory.editorFactory,
      //   // factory: CodeEditor.Factory,
      //   mimeTypeService: new CodeMirrorMimeTypeService() 
      // })
      content: new CodeEditorWrapper({
        model: context.model,
        uuid: UUID.uuid4(),
        factory: InputArea.defaultContentFactory.editorFactory,
        updateOnShow: true
      })
    });
  }
}