import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';


// import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ABCWidgetFactory, DocumentRegistry, DocumentWidget} from '@jupyterlab/docregistry';
import { TextfileModel } from './TextfileModel'

class TextfileFactory extends ABCWidgetFactory<DocumentWidget, TextfileModel> {
  constructor(options: DocumentRegistry.IWidgetExtensionOptions){
    super(options);
  }

  protected createNewWidget (
    context: DocumentRegistry.IContext<TextfileModel>
  ): DocumentWidget {
    return new DocumentWidget({
      context, 
      content: new 
    })
  }


}

/**
 * Initialization data for the jupyterlab-chat extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-chat:plugin',
  autoStart: true,
  requires: [],
  activate: (app: JupyterFrontEnd) => {




    console.log("hi");
    app.docRegistry.addFileType({
      name: 'comment',
      displayName: 'Comment',
      mimeTypes: ['text/json', 'application/json'],
      extensions: ['.comment'],
      fileFormat: 'json',
      contentType: 'file',
    })

  }
};

export default plugin;
