import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { CodeEditor } from '@jupyterlab/codeeditor';
import { CodeMirrorEditor } from '@jupyterlab/codemirror';

// import {InputArea} from '@jupyterlab/cells' 

// import { UUID } from '@lumino/coreutils';

// import { Widget } from '@lumino/widgets';

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
      // uuid: "579ba423-a705-41e1-92bd-d525c3a7f422", 
      // factory: InputArea.defaultContentFactory.editorFactory,
      // factory: CodeMirrorEditorFactory,
      host: document.body,
      model: new CodeEditor.Model,
    }
    let editorM= new CodeMirrorEditor(options);

    // editorM.addClass("histyle");
    console.log("the code mirror editor ob");
    console.log(editorM)
    // console.log(editorM.getLine(3))
    document.body.appendChild(editorM.host);
    // editorWrapper.show();

    // console.log(editorWrapper.editor.model.modelDB.isCollaborative);

    console.log('JupyterLab extension jupyterlab-chat is activated!');
  }
};

export default plugin;