import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { InputDialog } from '@jupyterlab/apputils';

// import { IWidgetTracker } from '@jupyterlab/apputils';
// import { Token } from '@lumino/coreutils'

// import { CommentfileWidget, TextfileWidget } from './widget';


import { CommentfileModelFactory, CommentfileWidgetFactory, TextfileModelFactory, TextfileWidgetFactory } from './factory';
// import {  CommentfileModelFactory, CommentfileWidgetFactory } from './factory';

// export const ICommentfileTracker = new Token<IWidgetTracker<CommentfileWidget>>(
//   'commentfiletracker'
// )

// export const ITextfileTracker = new Token<IWidgetTracker<TextfileWidget>>(
//   'textfiletracker'
// )
/**
 * Initialization data for the jupyterlab-chat extension.
 */
namespace CommandIDs {
  export const addComment = 'jl-chat:add-comment';
  export const renderComment = 'jl-chat:render-comment';
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-chat:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {

    // const namespace = 'comment';
    // const tracker = new WidgetTracker<CommentfileWidget>({ namespace });

    const widgetFactory = new CommentfileWidgetFactory({
      name: 'Comment editorrrrr',
      modelName: 'comment-model',
      fileTypes: ['comment'],
      defaultFor: ['comment']
    })
    app.docRegistry.addWidgetFactory(widgetFactory);

    const widgetFactory2 = new TextfileWidgetFactory({
      name: 'Text editorrrrr',
      modelName: 'textfile-model',
      fileTypes: ['text']
    })
    app.docRegistry.addWidgetFactory(widgetFactory2);

    app.commands.addCommand(CommandIDs.addComment, {
      label: 'Add Comment',
      execute: () => {
        // const cell = nbTracker.currentWidget?.content.activeCell;
        // if (cell == null) {
          // return;
        // }

        void InputDialog.getText({
          title: 'Enter Comment'
        }).then(value => {
          if (value.value != null) {
            // const comment: IComment = {
            //   id: UUID.uuid4(),
            //   type: 'cell',
            //   author: 'Bob',
            //   replies: [],
            //   text: value.value
            // };
          }
        });
      }
    });

    // widgetFactory.widgetCreated.connect((sender, widget) => {
    //   widget.context.pathChanged.connect(() => {
    //     void tracker.save(widget);
    //   });
    //   void tracker.add(widget);
    // })

    const modelFactory = new CommentfileModelFactory();
    app.docRegistry.addModelFactory(modelFactory);


    const modelFactory2 = new TextfileModelFactory()
    app.docRegistry.addModelFactory(modelFactory2);


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
