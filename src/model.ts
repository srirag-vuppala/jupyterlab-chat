import { IComment, IEmoticon, IIdentity, IReply } from './commentformat';
import { ACommentFactory } from './factory';
import { ICommentRegistry } from './registry';
import { ISharedDocument, YDocument } from '@jupyterlab/shared-models';
import * as Y from 'yjs';
import { PartialJSONValue } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import { Awareness } from 'y-protocols/awareness';
import { Menu } from '@lumino/widgets';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IModelDB, ModelDB } from '@jupyterlab/observables';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { Contents } from '@jupyterlab/services';

/**
 * The default model for comment files.
 */
export class CommentFileModel implements DocumentRegistry.IModel {
  /**
   * Construct a new `CommentFileModel`.
   */
  constructor(options: CommentFileModel.IOptions) {
    const { registry, commentMenu, isInitialized } = options;

    this.registry = registry;
    this._commentMenu = commentMenu;
    this._isInitialized = !!isInitialized;

    this.comments.observeDeep(this._commentsObserver);
  }

  /**
   * Dispose of the model and its resources.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    this._isDisposed = true;
    this.comments.unobserveDeep(this._commentsObserver);
  }

  /**
   * Serialize the model to JSON.
   */
  toJSON(): PartialJSONValue {
    return this.comments.toJSON();
  }

  /**
   * Deserialize the model from JSON.
   */
  fromJSON(value: PartialJSONValue): void {
    this.ymodel.transact(() => {
      const comments = this.comments;
      comments.delete(0, comments.length);
      comments.push(value as any as IComment[]);
    });

    this._contentChanged.emit();
  }

  /**
   * Serialize the model to a string.
   */
  toString(): string {
    return JSON.stringify(this.toJSON(), undefined, 2);
  }

  /**
   * Deserialize the model from a string.
   */
  fromString(value: string): void {
    this.fromJSON(JSON.parse(value !== '' ? value : '[]'));
  }

  private _commentsObserver = (events: Y.YEvent[]): void => {
    for (let event of events) {
      this._changed.emit(event.delta as any);
    }
  };

  // private _emitUpdate(index: number): void {
  //   this._changed.emit([
  //     { retain: index },
  //     { update: 1 }
  //   ]);

  //   this._contentChanged.emit();
  // }

  private _updateComment(comment: IComment, index: number): void {
    const comments = this.comments;
    this.ymodel.ydoc.transact(() => {
      comments.delete(index);
      comments.insert(index, [comment]);
    });
    this._contentChanged.emit();
  }

  /**
   * Create a comment from an `ICommentOptions` object.
   *
   * ### Notes
   * This will fail if there's no factory for the given comment type.
   */
  createComment(options: ICommentOptions): IComment | undefined {
    const factory = this.registry.getFactory(options.type);
    if (factory == null) {
      return;
    }

    if ('target' in options) {
      return factory.createComment(options, options.target);
    }

    return factory.createComment(options);
  }

  /**
   * Create a reply from an `IReplyOptions` object.
   */
  createReply(options: Exclude<IReplyOptions, 'parentID'>): IReply {
    return ACommentFactory.createReply(options);
  }

  /**
   * Create a comment from `options` and inserts it in `this.comments` at `index`.
   */
  insertComment(options: ICommentOptions, index: number): void {
    const comment = this.createComment(options);
    if (comment == null) {
      return;
    }

    this.comments.insert(index, [comment]);
    // Delta emitted by listener
    this._contentChanged.emit();
  }

  /**
   * Creates a comment from `options` and inserts it at the end of `this.comments`.
   */
  addComment(options: ICommentOptions): void {
    const comment = this.createComment(options);
    if (comment == null) {
      return;
    }

    this.comments.push([comment]);
    // Delta emitted by listener
    this._contentChanged.emit();
  }

  /**
   * Creates a reply from `options` and inserts it in the replies of the comment
   * with id `parentID` at `index`.
   */
  insertReply(options: IReplyOptions, parentID: string, index: number): void {
    const loc = this.getComment(parentID);
    if (loc == null) {
      return;
    }

    const reply = this.createReply(options);
    const newComment = { ...loc.comment };
    newComment.replies.splice(index, 0, reply);
    this._updateComment(newComment, loc.index);
  }

  /**
   * Creates a reply from `options` and appends it to the replies of the comment
   * with id `parentID`.
   */
  addReply(options: IReplyOptions, parentID: string): void {
    const loc = this.getComment(parentID);
    if (loc == null) {
      return;
    }

    const reply = this.createReply(options);
    const newComment = { ...loc.comment };
    newComment.replies.push(reply);
    this._updateComment(newComment, loc.index);
  }

  /**
   * Deletes the comment with id `id` from `this.comments`.
   */
  deleteComment(id: string): void {
    const loc = this.getComment(id);
    if (loc == null) {
      return;
    }

    this.comments.delete(loc.index);
    // Delta emitted by listener
    this._contentChanged.emit();
  }

  /**
   * Deletes the reply with id `id` from `this.comments`.
   *
   * If a `parentID` is given, it will be used to locate the parent comment.
   * Otherwise, all comments will be searched for the reply with the given id.
   */
  deleteReply(id: string, parentID?: string): void {
    const loc = this.getReply(id, parentID);
    if (loc == null) {
      return;
    }

    const newComment = { ...loc.parent };
    newComment.replies.splice(loc.index, 1);
    this._updateComment(newComment, loc.parentIndex);
  }

  /**
   * Applies the changes in `options` to the comment with id `id`.
   */
  editComment(
    options: Partial<Exclude<ICommentOptions, 'id'>>,
    id: string
  ): void {
    const loc = this.getComment(id);
    if (loc == null) {
      return;
    }

    const newComment = { ...loc.comment, ...options };
    this._updateComment(newComment, loc.index);
  }

  /**
   * Applies the changes in `options` to the reply with id `id`.
   *
   * If a `parentID` is given, it will be used to locate the parent comment.
   * Otherwise, all comments will be searched for the reply with the given id.
   */
  editReply(
    options: Partial<Exclude<IReplyOptions, 'id'>>,
    id: string,
    parentID?: string
  ): void {
    const loc = this.getReply(id, parentID);
    if (loc == null) {
      return;
    }

    Object.assign(loc.reply, loc.reply, options);
    const newComment = { ...loc.parent };
    this._updateComment(newComment, loc.parentIndex);
  }

  /**
   * Get the comment with id `id`. Returns undefined if not found.
   */
  getComment(id: string): CommentFileModel.ICommentLocation | undefined {
    const comments = this.comments;
    for (let i = 0; i < comments.length; i++) {
      const comment = comments.get(i);
      if (comment.id === id) {
        return {
          index: i,
          comment
        };
      }
    }

    return;
  }

  /**
   * Returns the reply with id `id`. Returns undefined if not found.
   *
   * If a `parentID` is given, it will be used to locate the parent comment.
   * Otherwise, all comments will be searched for the reply with the given id.
   */
  getReply(
    id: string,
    parentID?: string
  ): CommentFileModel.IReplyLocation | undefined {
    let parentIndex: number;
    let parent: IComment;

    if (parentID != null) {
      const parentLocation = this.getComment(parentID);
      if (parentLocation == null) {
        return;
      }

      parentIndex = parentLocation.index;
      parent = parentLocation.comment;

      for (let i = 0; i < parent.replies.length; i++) {
        const reply = parent.replies[i];
        if (reply.id === id) {
          return {
            parentIndex,
            parent,
            reply,
            index: i
          };
        }
      }

      return;
    }

    const comments = this.comments;
    for (let i = 0; i < comments.length; i++) {
      const parent = comments.get(i);
      for (let j = 0; i < parent.replies.length; i++) {
        const reply = parent.replies[j];
        if (reply.id === id) {
          return {
            parentIndex: i,
            parent,
            reply,
            index: j
          };
        }
      }
    }

    return;
  }

  initialize(): void {
    this.sharedModel.clearUndoHistory();
    this._isInitialized = true;
  }

  /**
   * The comments associated with the model.
   */
  get comments(): Y.Array<IComment> {
    return this.ymodel.ydoc.getArray('comments');
  }

  /**
   * The registry containing the comment factories needed to create the model's comments.
   */
  readonly registry: ICommentRegistry;

  /**
   * The underlying model handling RTC between clients.
   */
  readonly ymodel = new YDocument<any>();

  /**
   * The awareness associated with the document being commented on.
   */
  get awareness(): Awareness {
    return this.ymodel.awareness;
  }

  /**
   * The dropdown menu for comment widgets.
   */
  get commentMenu(): Menu | undefined {
    return this._commentMenu;
  }

  /**
   * TODO: A signal emitted when the model is changed.
   * See the notes on `CommentFileModel.IChange` below.
   */
  get changed(): ISignal<this, CommentFileModel.IChange[]> {
    return this._changed;
  }

  get sharedModel(): ISharedDocument {
    return this.ymodel;
  }

  get readOnly(): boolean {
    return this._readOnly;
  }
  set readOnly(newVal: boolean) {
    const oldVal = this.readOnly;
    if (newVal !== oldVal) {
      this._readOnly = newVal;
      this._signalStateChange(oldVal, newVal, 'readOnly');
    }
  }

  get dirty(): boolean {
    return this._dirty;
  }
  set dirty(newVal: boolean) {
    const oldVal = this.dirty;
    if (newVal !== oldVal) {
      this._dirty = newVal;
      this._signalStateChange(oldVal, newVal, 'dirty');
    }
  }

  get stateChanged(): ISignal<this, IChangedArgs<any>> {
    return this._stateChanged;
  }

  get contentChanged(): ISignal<this, void> {
    return this._contentChanged;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  private _signalStateChange(oldValue: any, newValue: any, name: string): void {
    this._stateChanged.emit({
      oldValue,
      newValue,
      name
    });
  }

  // These are never used--just here to satisfy the interface requirements.
  readonly modelDB: IModelDB = new ModelDB();
  readonly defaultKernelLanguage = '';
  readonly defaultKernelName = '';

  private _isInitialized: boolean;
  private _dirty: boolean = false;
  private _readOnly: boolean = false;
  private _isDisposed: boolean = false;
  private _commentMenu: Menu | undefined;
  private _changed = new Signal<this, CommentFileModel.IChange[]>(this);
  private _stateChanged = new Signal<this, IChangedArgs<any>>(this);
  private _contentChanged = new Signal<this, void>(this);
}

export namespace CommentFileModel {
  export interface IOptions {
    registry: ICommentRegistry;
    isInitialized?: boolean;
    commentMenu?: Menu;
  }

  /**
   * TODO: An interface that describes a change to a model.
   * This will be filled out once `YArrayEvent` is better understood.
   */
  export interface IChange {
    insert?: IComment[];
    retain?: number;
    delete?: number;
    update?: number;
  }

  export interface ICommentLocation {
    index: number;
    comment: IComment;
  }

  export interface IReplyLocation {
    parentIndex: number;
    index: number;
    parent: IComment;
    reply: IReply;
  }
}

export class CommentFileModelFactory
  implements DocumentRegistry.IModelFactory<CommentFileModel>
{
  constructor(options: CommentFileModelFactory.IOptions) {
    const { registry, commentMenu } = options;

    this._registry = registry;
    this._commentMenu = commentMenu;
  }

  readonly name: string = 'comment-file';
  readonly contentType: Contents.ContentType = 'file';
  readonly fileFormat: Contents.FileFormat = 'text';

  createNew(
    languagePreference?: string,
    modelDB?: IModelDB,
    isInitialized?: boolean
  ): CommentFileModel {
    const registry = this._registry;
    const commentMenu = this._commentMenu;
    return new CommentFileModel({
      registry,
      commentMenu,
      isInitialized
    });
  }

  preferredLanguage(path: string): string {
    return '';
  }

  dispose(): void {
    this._isDisposed = true;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  private _registry: ICommentRegistry;
  private _commentMenu: Menu;
  private _isDisposed = false;
}

export namespace CommentFileModelFactory {
  export interface IOptions {
    registry: ICommentRegistry;
    commentMenu: Menu;
  }
}

/**
 * Options object for creating a comment.
 */
export interface ICommentOptionsBase {
  text: string;
  identity: IIdentity;
  type: string;
  replies?: IReply[];
  emoticons?: IEmoticon[];
  id?: string; // defaults to UUID.uuid4();
}

export type ICommentOptions = ({ target: PartialJSONValue } | { source: any }) &
  ICommentOptionsBase;

/**
 * Options object for creating a reply.
 */
export interface IReplyOptions {
  text: string;
  identity: IIdentity;
  emoticons?: IEmoticon[];
  id?: string; // defaults to UUID.uuid4()
}
