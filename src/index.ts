import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { CodeEditor, CodeEditorWrapper } from '@jupyterlab/codeeditor';

import {InputArea} from '@jupyterlab/cells' 

import { UUID } from '@lumino/coreutils';

import '../style/editor.css'



/**
 * Initialization data for the jupyterlab-chat extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-chat:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    let options = {
      // uuid: UUID.uuid4(),
      uuid: "579ba423-a705-41e1-92bd-d525c3a7f422", 
      factory: InputArea.defaultContentFactory.editorFactory,
      model: new CodeEditor.Model,
    }
    let editorWrapper = new CodeEditorWrapper(options);

    editorWrapper.addClass("histyle");
    console.log(editorWrapper.node)
    document.body.appendChild(editorWrapper.node);
    editorWrapper.show();

    console.log(editorWrapper.editor.model.modelDB.isCollaborative);

    console.log('JupyterLab extension jupyterlab-chat is activated!');
  }
};

export default plugin;