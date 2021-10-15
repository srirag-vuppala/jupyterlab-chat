import { ICellComment, ICellSelectionComment } from './commentformat';
import { CommentFileModel, CommentWidgetFactory } from '../api';
import { Cell } from '@jupyterlab/cells';
import { INotebookTracker } from '@jupyterlab/notebook';
import { CellCommentWidget, CellSelectionCommentWidget } from './widget';
import { docFromCell, markCommentSelection } from './utils';

export class CellCommentWidgetFactory<
  C extends ICellComment = ICellComment
> extends CommentWidgetFactory<Cell, C> {
  constructor(options: CellCommentWidgetFactory.IOptions) {
    super(options);

    this._tracker = options.tracker;
  }

  createWidget(
    comment: ICellComment,
    model: CommentFileModel,
    target?: Cell
  ): CellCommentWidget | undefined {

    // console.log("cell id ")
    // console.log(comment.target.cellID)

    console.log(this._tracker.currentWidget?.content.model)
    this._tracker.currentWidget?.content.model?.cells.changed.connect((_, args) => {
      if (args.oldValues[0] !== undefined){
        if (args.oldValues[0].sharedModel.getId() === comment.target.cellID){
          comment.target.cellID = args.newValues[0].sharedModel.getId()
          console.log('hihi')
        }
      }
    })
    
    const cell = target ?? this._cellFromID(comment.target.cellID);
    if (cell == null) {
      console.error('Cell not found for comment', comment);
      return;
    }

    return new CellCommentWidget({
      model,
      comment,
      target: cell!
    });
  }

  private _cellFromID(id: string): Cell | undefined {
    // need to find a way to have this return the cell even if the type changes
    const notebook = this._tracker.currentWidget;
    if (notebook == null) {
      return;
    }

    // listen into a signal that tracks cell id and have it update the para: id to reflect the new id ?
    // notebook.content.model?.cells.changed.connect((_, args)=> {
    //   console.warn(args.newValues)
    //   id = args.newValues[0].sharedModel.getId()
    //   console.log(id)
    // })

    // console.log("notebook content")
    // console.log(notebook.content.widgets)
    return notebook.content.widgets.find(cell => cell.model.id === id);
    // notebook.content.widgets.forEach((cell)=> {
      // console.log(cell.model.id)
      // console.log(cell.id)
    // })
    // if (this._tracker.currentWidget?.id === id){
      // return notebook.content.widgets.find(cell => cell.parent?.id === id);
    // }

    // return notebook.content.widgets.find(cell => cell.model.sharedModel.getId() === id);

  }

  readonly widgetType = 'cell';
  readonly commentType = 'cell';

  private _tracker: INotebookTracker;
}

export namespace CellCommentWidgetFactory {
  export interface IOptions extends CommentWidgetFactory.IOptions {
    tracker: INotebookTracker;
  }
}

export class CellSelectionCommentWidgetFactory extends CommentWidgetFactory<
  Cell,
  ICellSelectionComment
> {
  constructor(options: CellCommentWidgetFactory.IOptions) {
    super(options);

    this._tracker = options.tracker;
  }

  createWidget(
    comment: ICellSelectionComment,
    model: CommentFileModel,
    target?: Cell
  ): CellSelectionCommentWidget | undefined {
    const cell = target ?? this._cellFromID(comment.target.cellID);
    if (cell == null) {
      console.error('Cell not found for comment', comment);
      return;
    }

    const mark = markCommentSelection(docFromCell(cell), comment);

    return new CellSelectionCommentWidget({
      model,
      comment,
      mark,
      target: cell
    });
  }

  private _cellFromID(id: string): Cell | undefined {
    const notebook = this._tracker.currentWidget;
    if (notebook == null) {
      return;
    }

    return notebook.content.widgets.find(cell => cell.model.id === id);
  }

  readonly widgetType = 'cell-selection';
  readonly commentType = 'cell-selection';

  private _tracker: INotebookTracker;
}
