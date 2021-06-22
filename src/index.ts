import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';


// import { DocumentRegistry } from '@jupyterlab/docregistry';

// import { ABCWidgetFactory, DocumentRegistry, DocumentWidget} from '@jupyterlab/docregistry';
// import { TextfileModel } from './TextfileModel'
import { TextfileModelFactory } from './factory';


// class TextfileWidgetFactory extends ABCWidgetFactory<DocumentWidget, TextfileModel> {
//   constructor(options: DocumentRegistry.IWidgetFactoryOptions){
//     super(options);
//   }
//   // I apparently need this to use ABCwidget
//   // protected createNewWidget (
//   //   context: DocumentRegistry.IContext<TextfileModel>
//   // ): DocumentWidget {
//   //   return new DocumentWidget({
//   //     context, 
//   //     content: new a;lsdjf;lakd
//   //   })
//   // }
// }


/**
 * Initialization data for the jupyterlab-chat extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-chat:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {

    // const widgetFactory = new TextfileWidgetFactory({
    //   name: 'Textfile editorrrrr',
    //   modelName: 'textfile-model',
    //   fileTypes: ['comment'],
    //   defaultFor: ['comment']
    // })

    const modelFactory = new TextfileModelFactory();
    app.docRegistry.addModelFactory(modelFactory);

    console.log("hi");
    app.docRegistry.addFileType({
      name: 'comment',
      displayName: 'Comment',
      mimeTypes: ['text/json', 'application/json'],
      extensions: ['.comment'],
      fileFormat: 'text',
      contentType: 'file',
    })

  }
};

export default plugin;
