// import { InputArea } from '@jupyterlab/cells';
// import { CodeEditor } from '@jupyterlab/codeeditor';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';

import { IModelDB } from '@jupyterlab/observables';

import { Contents } from '@jupyterlab/services';

// import { UUID } from '@lumino/coreutils';
import { CommentfileModel } from './CommentfileModel';

import { TextfileModel } from './TextfileModel';

import { CommentfilePanel, CommentfileWidget, TextfilePanel, TextfileWidget } from './widget';

export class CommentfileModelFactory
  implements DocumentRegistry.IModelFactory<CommentfileModel>
{
  get name(): string {
    return 'comment-model';
  }
  get contentType(): Contents.ContentType {
    return 'file';
  }
  get fileFormat(): Contents.FileFormat {
    return 'text';
  }
  get isDisposed(): boolean {
    return this._disposed;
  }

  dispose(): void {
    this._disposed = true;
  }
  preferredLanguage(path: string): string {
    return '';
  }
  createNew(languagePreference?: string, modelDB?: IModelDB): CommentfileModel {
    return new CommentfileModel(languagePreference, modelDB);
  }

  private _disposed = false;
}

export class TextfileModelFactory
  implements DocumentRegistry.IModelFactory<TextfileModel>
{
  get name(): string {
    return 'textfile-model';
  }
  get contentType(): Contents.ContentType {
    return 'file';
  }
  get fileFormat(): Contents.FileFormat {
    return 'text';
  }
  get isDisposed(): boolean {
    return this._disposed;
  }

  dispose(): void {
    this._disposed = true;
  }
  preferredLanguage(path: string): string {
    return '';
  }
  createNew(languagePreference?: string, modelDB?: IModelDB): TextfileModel {
    return new TextfileModel(languagePreference, modelDB);
  }
  private _disposed = false;
}

export class CommentfileWidgetFactory extends ABCWidgetFactory<
  CommentfileWidget,
  CommentfileModel
> {
  constructor(options: DocumentRegistry.IWidgetFactoryOptions) {
    super(options);
  }
  // I apparently need this to use ABCwidget
  protected createNewWidget(
    context: DocumentRegistry.IContext<CommentfileModel>
  ): CommentfileWidget {
    return new CommentfileWidget({
      context,
      content: new CommentfilePanel(context)
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
  // I apparently need this to use ABCwidget
  protected createNewWidget(
    context: DocumentRegistry.IContext<TextfileModel>
  ): TextfileWidget {
    return new TextfileWidget({
      context,
      // content: new TextfilePanel({
      //   uuid: UUID.uuid4(),
      //   factory: InputArea.defaultContentFactory.editorFactory,
      //   model: new CodeEditor.Model, 
      //   // model: new TextfileModel.Model
      // }, context)
      content: new TextfilePanel(context)
    });
  }
}