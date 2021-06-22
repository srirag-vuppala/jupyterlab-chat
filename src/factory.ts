import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';

import { IModelDB } from '@jupyterlab/observables';

import { Contents } from '@jupyterlab/services';

import { CommentfileModel } from './CommentfileModel';

import { CommentfileWidget, ExamplePanel } from './widget';


 export class CommentfileModelFactory
 implements DocumentRegistry.IModelFactory<CommentfileModel> {

 get name(): string {
   return 'example-model';
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
 createNew(languagePreference?: string, modelDB?: IModelDB): CommentfileModel{
   return new CommentfileModel(modelDB);
 }
 private _disposed = false;
}


export class CommentfileWidgetFactory extends ABCWidgetFactory<CommentfileWidget, CommentfileModel> {
  constructor(options: DocumentRegistry.IWidgetFactoryOptions){
    super(options);
  }
  // I apparently need this to use ABCwidget
  protected createNewWidget (
    context: DocumentRegistry.IContext<CommentfileModel>
    // context: DocumentRegistry.Context
  ): CommentfileWidget{
    return new CommentfileWidget({
      context, 
      content: new ExamplePanel(context) 
    });
  }
}