import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IWidgetTracker, WidgetTracker } from '@jupyterlab/apputils';
import { Token } from '@lumino/coreutils'

import { CommentfileWidget } from './widget';


// import { DocumentRegistry } from '@jupyterlab/docregistry';

// import { ABCWidgetFactory, DocumentRegistry, DocumentWidget} from '@jupyterlab/docregistry';
import { CommentfileModelFactory, CommentfileWidgetFactory } from './factory';

export const ICommentfileTracker = new Token<IWidgetTracker<CommentfileWidget>>(
  'commentfiletracker'
)



/**
 * Initialization data for the jupyterlab-chat extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-chat:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {

    const namespace = 'comment';
    const tracker = new WidgetTracker<CommentfileWidget>({ namespace });

    const widgetFactory = new CommentfileWidgetFactory({
      name: 'Comment editorrrrr',
      modelName: 'CommentfileModel',
      fileTypes: ['comment'],
      defaultFor: ['comment']
    })

    widgetFactory.widgetCreated.connect((sender, widget) => {
      widget.context.pathChanged.connect(() => {
        void tracker.save(widget);
      });
      void tracker.add(widget);
    })
    app.docRegistry.addWidgetFactory(widgetFactory);

    const modelFactory = new CommentfileModelFactory();
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
