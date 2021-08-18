import {
  ICellSelectionComment,
  IComment,
  IIdentity,
  IReply,
  ITextSelectionComment
} from './commentformat';
import { WidgetTracker } from '@jupyterlab/apputils';
import { PartialJSONObject, PartialJSONValue, UUID } from '@lumino/coreutils';
import { getCommentTimeString, truncate } from './utils';
import { Cell } from '@jupyterlab/cells';
import { CommentFileModel } from './model';
import { CommentWidget } from './widget';
import { INotebookTracker } from '@jupyterlab/notebook';
import { CodeEditor, CodeEditorWrapper } from '@jupyterlab/codeeditor';
import { CodeMirrorEditor } from '@jupyterlab/codemirror';
import * as CodeMirror from 'codemirror';

export abstract class ACommentFactory<T = any> {
  constructor(options: ACommentFactory.IOptions) {
    const { type } = options;
    this.type = type;
  }

  abstract targetToJSON(target: T): PartialJSONValue;
  abstract targetFromJSON(json: PartialJSONValue): T | undefined;
  abstract getPreviewText(comment: IComment, target: T): string;

  /**
   * Serializes a comment to JSON
   */
  toJSON(comment: IComment): PartialJSONValue {
    return comment as unknown as PartialJSONObject;
  }

  getElement(comment: IComment, target?: T): HTMLElement | undefined {
    return;
  }

  createWidget(
    comment: IComment,
    model: CommentFileModel,
    target?: T
  ): CommentWidget<any> | null {
    return new CommentWidget({
      model,
      id: comment.id,
      target: target ?? this.targetFromJSON(comment.target),
      factory: this
    });
  }

  createComment(
    options: ACommentFactory.ICommentOptions<T>,
    target?: PartialJSONValue
  ): IComment {
    const { text, identity, replies, id } = options;
    return {
      text,
      identity,
      type: this.type,
      id: id ?? UUID.uuid4(),
      replies: replies ?? [],
      time: getCommentTimeString(),
      target: target ?? this.targetToJSON(options.source!)
    };
  }

  static createReply(options: ACommentFactory.IReplyOptions): IReply {
    const { text, identity, id } = options;

    return {
      text,
      identity,
      id: id ?? UUID.uuid4(),
      time: getCommentTimeString(),
      type: 'reply'
    };
  }

  readonly type: string;
}

export class TestCommentFactory extends ACommentFactory<null> {
  constructor() {
    super({ type: 'test' });
  }

  getPreviewText() {
    return '';
  }

  targetToJSON() {
    return null;
  }

  targetFromJSON() {
    return null;
  }
}

export class CellCommentFactory extends ACommentFactory<Cell> {
  constructor(tracker: INotebookTracker) {
    super({ type: 'cell' });

    this._tracker = tracker;
  }

  getPreviewText(comment: IComment, target: any): string {
    return '';
  }

  targetToJSON(cell: Cell): PartialJSONValue {
    return { cellID: cell.model.id };
  }

  targetFromJSON(json: PartialJSONValue): Cell | undefined {
    if (!(json instanceof Object && 'cellID' in json)) {
      return;
    }

    const notebook = this._tracker.currentWidget;
    if (notebook == null) {
      return;
    }

    const cellID = json['cellID'];
    return notebook.content.widgets.find(w => w.model.id === cellID);
  }

  getElement(comment: IComment, target?: Cell): HTMLElement | undefined {
    return target?.node ?? this.targetFromJSON(comment.target)?.node;
  }

  private _tracker: INotebookTracker;
}

export class CellSelectionCommentFactory extends ACommentFactory<Cell> {
  constructor(tracker: INotebookTracker) {
    super({ type: 'cell-selection' });

    this._tracker = tracker;
  }

  toJSON(comment: IComment): PartialJSONValue {
    const cell = this.targetFromJSON(comment.target);
    if (cell == null) {
      return 'error: cell not found';
    }

    const json = super.toJSON(comment);

    const mark = this._marks.get(comment.id);
    if (mark == null) {
      console.warn(
        'no mark found--serializing based on initial text selection position'
      );
      return json;
    }

    const range = mark.find();
    if (range == null) {
      console.warn(
        'mark no longer exists in cell--serializing based on initial text selection position'
      );
      return json;
    }

    const cellSelectionComment = json as unknown as ICellSelectionComment;
    const { from, to } = range as CodeMirror.MarkerRange;
    cellSelectionComment.target.start = Private.toCodeEditorPosition(from);
    cellSelectionComment.target.end = Private.toCodeEditorPosition(to);

    return cellSelectionComment as unknown as PartialJSONObject;
  }

  createWidget(
    comment: IComment,
    model: CommentFileModel,
    target?: Cell
  ): CommentWidget<Cell> | null {
    const cell = target ?? this.targetFromJSON(comment.target);
    if (cell == null) {
      console.warn('no cell found for cell selection comment', comment);
      return null;
    }

    const widget = super.createWidget(comment, model, cell);
    if (widget == null) {
      return null;
    }

    const mark = Private.markCommentSelection(
      (cell.editor as CodeMirrorEditor).doc,
      comment as ITextSelectionComment
    );

    this._marks.set(comment.id, mark);

    widget.disposed.connect(() => {
      this._marks.delete(comment.id);
      mark.clear();
    });

    return widget;
  }

  targetToJSON(cell: Cell): PartialJSONValue {
    const { start, end } = cell.editor.getSelection();
    return {
      cellID: cell.model.id,
      start,
      end
    };
  }

  targetFromJSON(json: PartialJSONValue): Cell | undefined {
    if (!(json instanceof Object && 'cellID' in json)) {
      return;
    }

    const notebook = this._tracker.currentWidget;
    if (notebook == null) {
      return;
    }

    const cellID = json['cellID'];
    return notebook.content.widgets.find(w => w.model.id === cellID);
  }

  getPreviewText(comment: IComment, target?: Cell): string {
    const cell = target ?? this.targetFromJSON(comment.target);
    if (cell == null) {
      console.warn('no cell found for cell selection comment', comment);
      return '';
    }

    const mark = this._marks.get(comment.id);
    if (mark == null) {
      return Private.getMockCommentPreviewText(
        (cell.editor as CodeMirrorEditor).doc,
        comment as ITextSelectionComment
      );
    }

    const range = mark.find();
    if (range == null) {
      return '';
    }

    const doc = (cell.editor as CodeMirrorEditor).doc;
    const { from, to } = range as CodeMirror.MarkerRange;
    const text = doc.getRange(from, to);

    return truncate(text, 140);
  }

  getElement(comment: IComment, target?: Cell): HTMLElement | undefined {
    return target?.node ?? this.targetFromJSON(comment.target)?.node;
  }

  private _tracker: INotebookTracker;
  private _marks = new Map<string, CodeMirror.TextMarker>();
}

export class HTMLElementCommentFactory extends ACommentFactory<HTMLElement> {
  constructor(options: HTMLElementCommentFactory.IOptions) {
    super(options);

    this._root = options.root ?? document.body;
    console.log(this._root);
  }

  getElement(comment: IComment, target?: HTMLElement): HTMLElement | undefined {
    return target ?? this.targetFromJSON(comment.target);
  }

  targetToJSON(target: HTMLElement): PartialJSONValue {
    return {
      id: target.id
    };
  }

  targetFromJSON(json: PartialJSONValue): HTMLElement | undefined {
    if (!(json instanceof Object && 'id' in json)) {
      return;
    }

    return document.getElementById(json['id'] as string) ?? undefined;
  }

  getPreviewText(): string {
    return '';
  }

  private _root: HTMLElement;
}

export class TextSelectionCommentFactory extends ACommentFactory<CodeEditorWrapper> {
  constructor(
    options: ACommentFactory.IOptions,
    tracker: WidgetTracker<CodeEditorWrapper>
  ) {
    super({ type: options.type });
    this._tracker = tracker;
  }

  createWidget(
    comment: IComment,
    model: CommentFileModel,
    target?: CodeEditorWrapper
  ): CommentWidget<CodeEditorWrapper> | null {
    const wrapper = target ?? this.targetFromJSON(comment.target);
    if (wrapper == null) {
      console.warn('no valid selection for: ', comment);
      return null;
    }

    const widget = super.createWidget(comment, model, wrapper);
    if (widget == null) {
      return null;
    }

    const mark = Private.markCommentSelection(
      (wrapper.editor as CodeMirrorEditor).doc,
      comment as ITextSelectionComment
    );

    this._marks.set(comment.id, mark);

    widget.disposed.connect(() => {
      this._marks.delete(comment.id);
      mark.clear();
    });

    return widget;
  }

  toJSON(comment: IComment): PartialJSONValue {
    const wrapper = this.targetFromJSON(comment.target);
    if (wrapper == null) {
      return 'error: code editor wrapper not found';
    }

    const json = super.toJSON(comment);

    const mark = this._marks.get(comment.id);
    if (mark == null) {
      console.warn(
        'no mark found--serializing based on initial text selection position'
      );
      return json;
    }

    const range = mark.find();
    if (range == null) {
      console.warn(
        'mark no longer exists in code editor--serializing based on initial text selection position'
      );
      return json;
    }

    const textSelectionComment = json as unknown as ICellSelectionComment;
    const { from, to } = range as CodeMirror.MarkerRange;
    textSelectionComment.target.start = Private.toCodeEditorPosition(from);
    textSelectionComment.target.end = Private.toCodeEditorPosition(to);

    return textSelectionComment as unknown as PartialJSONObject;
  }

  targetToJSON(wrapper: CodeEditorWrapper): PartialJSONValue {
    let { start, end } = wrapper.editor.getSelection();
    if (
      start.line > end.line ||
      (start.line === end.line && start.column > end.column)
    ) {
      [start, end] = [end, start];
    }
    return {
      start,
      end
    };
  }

  targetFromJSON(json: PartialJSONValue): CodeEditorWrapper | undefined {
    return this._tracker.currentWidget ?? undefined;
  }

  getPreviewText(comment: IComment, target?: CodeEditorWrapper): string {
    const wrapper = target ?? this.targetFromJSON(comment.target);
    if (wrapper == null) {
      console.warn('no CodeEditorWrapper found on text file');
      return '';
    }

    const doc = (wrapper.editor as CodeMirrorEditor).doc;

    const mark = this._marks.get(comment.id);
    if (mark == null) {
      return Private.getMockCommentPreviewText(
        doc,
        comment as ITextSelectionComment
      );
    }

    const range = mark.find();
    if (range == null) {
      return '';
    }

    const { from, to } = range as CodeMirror.MarkerRange;
    const text = doc.getRange(from, to);

    return truncate(text, 140);
  }

  getElement(
    comment: IComment,
    target?: CodeEditorWrapper
  ): HTMLElement | undefined {
    return document.getElementById(`CommentMark-${comment.id}`) ?? undefined;
  }

  private _tracker: WidgetTracker<CodeEditorWrapper>;
  private _marks = new Map<string, CodeMirror.TextMarker>();
}

export namespace HTMLElementCommentFactory {
  export interface IOptions extends ACommentFactory.IOptions {
    root?: HTMLElement;
  }
}

export namespace ACommentFactory {
  export interface IOptions {
    type: string; // cell or cell-selection or text-selection
  }

  export interface IReplyOptions {
    text: string;
    identity: IIdentity;
    id?: string;
  }

  export interface ICommentOptions<T> extends IReplyOptions {
    source?: T;
    replies?: IReply[];
  }
}

namespace Private {
  //function that converts a line-column pairing to an index
  export function lineToIndex(str: string, line: number, col: number): number {
    if (line == 0) {
      return col;
    } else {
      let arr = str.split('\n');
      return arr.slice(0, line).join('\n').length + col + 1;
    }
  }

  export function markCommentSelection(
    doc: CodeMirror.Doc,
    comment: ITextSelectionComment
  ): CodeMirror.TextMarker {
    const color = comment.identity.color;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const { start, end } = comment.target;
    const forward =
      start.line < end.line ||
      (start.line === end.line && start.column <= end.column);
    const anchor = toCodeMirrorPosition(forward ? start : end);
    const head = toCodeMirrorPosition(forward ? end : start);

    return doc.markText(anchor, head, {
      className: 'jc-Highlight',
      title: `${comment.identity.name}: ${truncate(comment.text, 140)}`,
      css: `background-color: rgba( ${r}, ${g}, ${b}, 0.15)`,
      attributes: { id: `CommentMark-${comment.id}` }
    });
  }

  export function toCodeMirrorPosition(
    pos: CodeEditor.IPosition
  ): CodeMirror.Position {
    return {
      line: pos.line,
      ch: pos.column
    };
  }

  export function toCodeEditorPosition(
    pos: CodeMirror.Position
  ): CodeEditor.IPosition {
    return {
      line: pos.line,
      column: pos.ch
    };
  }

  export function getMockCommentPreviewText(
    doc: CodeMirror.Doc,
    comment: ITextSelectionComment
  ): string {
    const { start, end } = comment.target;
    const forward =
      start.line < end.line ||
      (start.line === end.line && start.column <= end.column);
    const from = toCodeMirrorPosition(forward ? start : end);
    const to = toCodeMirrorPosition(forward ? end : start);
    const text = doc.getRange(from, to);

    return truncate(text, 140);
  }
}
