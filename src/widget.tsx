import { DocumentWidget } from '@jupyterlab/docregistry';

// import { Widget } from '@lumino/widgets';

// import { Message } from '@lumino/messaging';

// import { Signal } from '@lumino/signaling';

// import { ReactWidget } from '@jupyterlab/apputils';
// import React  from 'react';

//TODO
//use Shared object ???
import {
  // CommentfileChange,
  CommentfileModel,
  // CommentfilePosition
} from './CommentfileModel';
import {
  // TextfileChange,
  TextfileModel,
  // TextfilePosition
} from './TextfileModel';
import { CodeEditorWrapper } from '@jupyterlab/codeeditor';

// export class TextfileWidget extends DocumentWidget<TextfilePanel, TextfileModel> {
//   constructor(options: DocumentWidget.IOptions<TextfilePanel, TextfileModel>) {
//     super(options);
//   }

//   /**
//    * Dispose of the resources held by the widget.
//    */
//   dispose(): void {
//     this.content.dispose();
//     super.dispose();
//   }
// }

export class TextfileWidget extends DocumentWidget<CodeEditorWrapper, TextfileModel> {
  constructor(options: DocumentWidget.IOptions<CodeEditorWrapper, TextfileModel>) {
    super(options);
    this.addClass('textpanel-style')
  }
  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this.content.dispose();
    super.dispose();
  }
}

export class CommentfileWidget extends DocumentWidget<CodeEditorWrapper, CommentfileModel> {
  constructor(options: DocumentWidget.IOptions<CodeEditorWrapper, CommentfileModel>) {
    super(options);
    this.addClass('textpanel-style')
  }
  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this.content.dispose();
    super.dispose();
  }
}



// export class TextfilePanel extends Widget {
//     constructor(context: DocumentRegistry.IContext<TextfileModel>) {
//         super();
//         // this.addClass('textpanel-style');
//         this.addClass('.jp-example-canvas');
    
//         this._context = context;
// //         this._isDown = false;
// //         this._offset = { x: 0, y: 0 };
//         this._clients = {};
    
//         void this._context.ready.then(value => {
//           this._context.model.sharedModelChanged.connect(this._onContentChanged);
//           this._context.model.clientChanged.connect(this._onClientChanged);
    
//           const obj = this._context.model.getSharedObject();
//           this._box.innerText = obj.content;
// //           this._cube.style.left = obj.x + 'px';
// //           this._cube.style.top = obj.y + 'px';
// //           this._cube.innerText = obj.content;
    
//           this.update();
//         });
    
//         // const obj = this._context.model.getSharedObject();
//         this._box = document.createElement('input');
//         this._box.className = 'textpanel-box';
//         // this._box.textContent = obj.content;
//         // this._context.model.setContent(this._box.innerText)
//         this._context.model.setContent("srirag")
//         this.node.appendChild(this._box);
//         // this._cube = document.createElement('div');
// //         this._cube.className = 'jp-example-cube';
// //         this._cube.style.left = obj.x + 'px';
// //         this._cube.style.top = obj.y + 'px';
// //         this._cube.innerText = obj.content;
// //         this.node.appendChild(this._cube);
//       }
    
//       /**
//        * Dispose of the resources held by the widget.
//        */
//       dispose(): void {
//         if (this.isDisposed) {
//           return;
//         }
//         this._context.model.sharedModelChanged.disconnect(this._onContentChanged);
//         Signal.clearData(this);
//         super.dispose();
//       }
    
//       /**
//        * Handle `after-attach` messages sent to the widget.
//        *
//        * @param msg
//        */
//     //   protected onAfterAttach(msg: Message): void {
//     //     super.onAfterAttach(msg);
//     //     // this._cube.addEventListener('mousedown', this, true);
//     //     // this._cube.addEventListener('mouseup', this, true);
//     //     this._box.addEventListener('mousedown', this, true);
//     //     this._box.addEventListener('mouseup', this, true);
//     //     this.node.addEventListener('mouseenter', this, true);
//     //     this.node.addEventListener('mouseleave', this, true);
//     //     this.node.addEventListener('mousemove', this, true);
//     //   }
    
// //       /**
// //        * Handle `before-detach` messages sent to the widget.
// //        *
// //        * @param msg
// //        */
// //       protected onBeforeDetach(msg: Message): void {
// //         super.onBeforeDetach(msg);
// //         this._cube.removeEventListener('mousedown', this, true);
// //         this._cube.removeEventListener('mouseup', this, true);
// //         this.node.removeEventListener('mouseenter', this, true);
// //         this.node.removeEventListener('mouseleave', this, true);
// //         this.node.removeEventListener('mousemove', this, true);
// //       }
    
// //       /**
// //        * Handle event messages sent to the widget.
// //        *
// //        * @param event
// //        */
// //       public handleEvent(event: MouseEvent): void {
// //         event.preventDefault();
// //         event.stopPropagation();
    
// //         if (event.type) {
// //           switch (event.type) {
// //             case 'mousedown':
// //               this._isDown = true;
// //               this._offset = {
// //                 x: this._cube.offsetLeft - event.clientX,
// //                 y: this._cube.offsetTop - event.clientY
// //               };
// //               break;
// //             case 'mouseup':
// //               this._isDown = false;
// //               break;
// //             case 'mouseenter':
// //               break;
// //             case 'mouseleave':
// //               // Wrapping the modifications to the shared model into a flag
// //               // to prevent apply changes triggered by the same client
// //               this._context.model.editing = true;
// //               //   this._context.model.setClient({ x: event.x, y: event.y});
// //               this._context.model.editing = false;
// //               break;
// //             case 'mousemove':
// //               // Wrapping the modifications to the shared model into a flag
// //               // to prevent apply changes triggered by the same client
// //               this._context.model.editing = true;
// //               const offset = this.node.getBoundingClientRect();
// //               const x = event.x - offset.left;
// //               const y = event.y - offset.top;
// //               this._context.model.setClient({ x, y });
// //               this._context.model.editing = false;
    
// //               if (this._isDown) {
// //                 // Wrapping the modifications to the shared model into a flag
// //                 // to prevent apply changes triggered by the same client
// //                 this._context.model.editing = true;
// //                 const x = event.clientX + this._offset.x;
// //                 const y = event.clientY + this._offset.y;
// //                 this._cube.style.left = x + 'px';
// //                 this._cube.style.top = y + 'px';
// //                 this._context.model.setPosition({ x, y });
// //                 this._context.model.editing = false;
// //               }
// //               break;
// //           }
// //         }
// //       }
    
// //       /**
// //        * Callback to listen for changes on the model. This callback listens
// //        * to changes on shared model's content.
// //        *
// //        * @param sender: The DocumentModel that triggers the changes.
// //        *
// //        * @param change: The changes on the model
// //        */
//       private _onContentChanged = (
//         sender: TextfileModel,
//         change: TextfileChange
//       ): void => {
// //         // Wrapping the updates into a flag to prevent apply changes triggered by the same client
//         if (!this._context.model.editing && change.positionChange) {
//             // this._context.model.setContent(change.contentChange + " . ");
//             console.log(change)
//         //   this._cube.style.left = change.positionChange.x + 'px';
// //           this._cube.style.top = change.positionChange.y + 'px';
// //           // updating the widgets to re-render it
            
//           this.update();
//         }
//       };
    
// //       /**
// //        * Callback to listen for changes on the model. This callback listens
// //        * to changes on the different clients sharing the document.
// //        *
// //        * @param sender: The DocumentModel that triggers the changes.
// //        *
// //        * @param clients: The list of client's states.
// //        */
//       private _onClientChanged = (
//         sender: TextfileModel,
//         clients: Map<number, any>
//       ): void => {
// //         // Wrapping the updates into a flag to prevent apply changes triggered by the same client
//         if (!this._context.model.editing) {
//           clients.forEach((client, key) => {
//             const id = key.toString();


    
//             if (client.mouse && this._clients[id]) {
//               this._clients[id].style.left = client.mouse.x + 'px';
//               this._clients[id].style.top = client.mouse.y + 'px';
//             } else if (client.mouse && !this._clients[id]) {
//               const el = document.createElement('div');
//               el.className = 'jp-example-client';
//               el.style.left = client.mouse.x + 'px';
//               el.style.top = client.mouse.y + 'px';
//               el.innerText = id.toString();
//               this._clients[id] = el;
//               this.node.appendChild(el);
//             } else if (!client.mouse && this._clients[id]) {
//               this.node.removeChild(this._clients[id]);
//               //TODO : FIXME
//               //   this._clients[id] = undefined;
//               //   this._clients[id] = document.documentElement;
//             }
//           });
    
// //           // updating the widgets to re-render it
//           this.update();
//         }
//       };
    
// //       private _isDown: boolean;
// //       private _offset: TextfilePosition;
// //       private _cube: HTMLElement;
//       private _box: HTMLElement;
//       private _clients: { [id: string]: HTMLElement };
//       private _context: DocumentRegistry.IContext<TextfileModel>;

// } 

/**
 * DocumentWidget: widget that represents the view or editor for a file type.
 */
// export class CommentfileWidget extends DocumentWidget<
//   CommentfilePanel,
//   CommentfileModel
// > {
//   constructor(
//     options: DocumentWidget.IOptions<CommentfilePanel, CommentfileModel>
//   ) {
//     super(options);
//   }

//   /**
//    * Dispose of the resources held by the widget.
//    */
//   dispose(): void {
//     this.content.dispose();
//     super.dispose();
//   }
// }

/**
 * Widget that contains the main view of the DocumentWidget.
 */
// export class CommentfilePanel extends Widget {
//   constructor(context: DocumentRegistry.IContext<CommentfileModel>) {
//     super();
//     this.addClass('jp-example-canvas');

//     this._context = context;
//     this._isDown = false;
//     this._offset = { x: 0, y: 0 };
//     this._clients = {};

//     void this._context.ready.then(value => {
//       this._context.model.sharedModelChanged.connect(this._onContentChanged);
//       this._context.model.clientChanged.connect(this._onClientChanged);

//       const obj = this._context.model.getSharedObject();
//       this._cube.style.left = obj.x + 'px';
//       this._cube.style.top = obj.y + 'px';
//       this._cube.innerText = obj.content;

//       this.update();
//     });

//     const obj = this._context.model.getSharedObject();
//     this._cube = document.createElement('div');
//     this._cube.className = 'jp-example-cube';
//     this._cube.style.left = obj.x + 'px';
//     this._cube.style.top = obj.y + 'px';
//     this._cube.innerText = obj.content;
//     this.node.appendChild(this._cube);
//   }

//   dispose(): void {
//     if (this.isDisposed) {
//       return;
//     }
//     this._context.model.sharedModelChanged.disconnect(this._onContentChanged);
//     Signal.clearData(this);
//     super.dispose();
//   }

//   protected onAfterAttach(msg: Message): void {
//     super.onAfterAttach(msg);
//     this._cube.addEventListener('mousedown', this, true);
//     this._cube.addEventListener('mouseup', this, true);
//     this.node.addEventListener('mouseenter', this, true);
//     this.node.addEventListener('mouseleave', this, true);
//     this.node.addEventListener('mousemove', this, true);
//   }

//   protected onBeforeDetach(msg: Message): void {
//     super.onBeforeDetach(msg);
//     this._cube.removeEventListener('mousedown', this, true);
//     this._cube.removeEventListener('mouseup', this, true);
//     this.node.removeEventListener('mouseenter', this, true);
//     this.node.removeEventListener('mouseleave', this, true);
//     this.node.removeEventListener('mousemove', this, true);
//   }

//   public handleEvent(event: MouseEvent): void {
//     event.preventDefault();
//     event.stopPropagation();

//     if (event.type) {
//       switch (event.type) {
//         case 'mousedown':
//           this._isDown = true;
//           this._offset = {
//             x: this._cube.offsetLeft - event.clientX,
//             y: this._cube.offsetTop - event.clientY
//           };
//           break;
//         case 'mouseup':
//           this._isDown = false;
//           break;
//         case 'mouseenter':
//           break;
//         case 'mouseleave':
//           // Wrapping the modifications to the shared model into a flag
//           // to prevent apply changes triggered by the same client
//           this._context.model.editing = true;
//           //   this._context.model.setClient({ x: event.x, y: event.y});
//           this._context.model.editing = false;
//           break;
//         case 'mousemove':
//           // Wrapping the modifications to the shared model into a flag
//           // to prevent apply changes triggered by the same client
//           this._context.model.editing = true;
//           const offset = this.node.getBoundingClientRect();
//           const x = event.x - offset.left;
//           const y = event.y - offset.top;
//           this._context.model.setClient({ x, y });
//           this._context.model.editing = false;

//           if (this._isDown) {
//             // Wrapping the modifications to the shared model into a flag
//             // to prevent apply changes triggered by the same client
//             this._context.model.editing = true;
//             const x = event.clientX + this._offset.x;
//             const y = event.clientY + this._offset.y;
//             this._cube.style.left = x + 'px';
//             this._cube.style.top = y + 'px';
//             this._context.model.setPosition({ x, y });
//             this._context.model.editing = false;
//           }
//           break;
//       }
//     }
//   }

//   private _onContentChanged = (
//     sender: CommentfileModel,
//     change: CommentfileChange
//   ): void => {
//     // Wrapping the updates into a flag to prevent apply changes triggered by the same client
//     if (!this._context.model.editing && change.positionChange) {
//       this._cube.style.left = change.positionChange.x + 'px';
//       this._cube.style.top = change.positionChange.y + 'px';
//       // updating the widgets to re-render it
//       this.update();
//     }
//   };

//   private _onClientChanged = (
//     sender: CommentfileModel,
//     clients: Map<number, any>
//   ): void => {
//     // Wrapping the updates into a flag to prevent apply changes triggered by the same client
//     if (!this._context.model.editing) {
//       clients.forEach((client, key) => {
//         const id = key.toString();

//         if (client.mouse && this._clients[id]) {
//           this._clients[id].style.left = client.mouse.x + 'px';
//           this._clients[id].style.top = client.mouse.y + 'px';
//         } else if (client.mouse && !this._clients[id]) {
//           const el = document.createElement('div');
//           el.className = 'jp-example-client';
//           el.style.left = client.mouse.x + 'px';
//           el.style.top = client.mouse.y + 'px';
//           el.innerText = id.toString();
//           this._clients[id] = el;
//           this.node.appendChild(el);
//         } else if (!client.mouse && this._clients[id]) {
//           this.node.removeChild(this._clients[id]);
//           //TODO : FIXME
//           //   this._clients[id] = undefined;
//           //   this._clients[id] = document.documentElement;
//         }
//       });

//       // updating the widgets to re-render it
//       this.update();
//     }
//   };

//   private _isDown: boolean;
//   private _offset: CommentfilePosition;
//   private _cube: HTMLElement;
//   private _clients: { [id: string]: HTMLElement };
//   private _context: DocumentRegistry.IContext<CommentfileModel>;
// }

// const ReactComponent = (): JSX.Element => {
//     return (
//         <div>

//         </div>
//     )
// }
