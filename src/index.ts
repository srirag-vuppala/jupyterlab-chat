import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

// Document manager uses document registry to create models and widgets for documents
import { DocumentManager } from '@jupyterlab/docmanager';
// Document registry registers document types and factories. Plugin will require the an instance of it to register its own content types and providers
// Document widget represents the UI of the document.
import { DocumentRegistry, DocumentWidget, ABCWidgetFactory } from '@jupyterlab/docregistry';

import { Widget } from '@lumino/widgets';


// Model
// class SimpleModel implements DocumentRegistry
// class SimpleModel implements DocumentRegistry.IModel {
// }
let SimpleModel = new DocumentRegistry().IModel;
// let SimpleModel = new DocumentRegistry().IModel;

// Factory

// Document Widget
  // Core Widget
  let SimpleCoreWidget = new Widget();
let SimpleWidget = new DocumentWidget(SimpleCoreWidget, SimpleModel);



/**
 * Initialization data for the jupyterlab-chat extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-chat:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd ) => {
    console.log('JupyterLab extension jupyterlab-chat is activated!');
  }
};

export default plugin;
