import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import * as React from 'react';
import { ellipsesIcon } from '@jupyterlab/ui-components';
import {
  Emoticon,
  emoticonList,
  getEmoticonByID,
  IComment,
  IEmoticon,
  IIdentity,
  IReply
} from './commentformat';
import { getIdentity } from './utils';
import { Menu, Panel } from '@lumino/widgets';
import { ISignal, Signal } from '@lumino/signaling';
import { ACommentFactory } from './factory';
import { CommentFileModel } from './model';
import { Context } from '@jupyterlab/docregistry';
import { Message } from '@lumino/messaging';
import { PartialJSONValue } from '@lumino/coreutils';

/**
 * This type comes from @jupyterlab/apputils/vdom.ts but isn't exported.
 */
type ReactRenderElement =
  | Array<React.ReactElement<any>>
  | React.ReactElement<any>;

type CommentProps = {
  comment: IComment;
  className?: string;
  editable?: boolean;
  target?: any;
  factory: ACommentFactory;
};

type CommentWithRepliesProps = {
  collapseNeeded: Signal<CommentWidget<any>, boolean>;
  comment: IComment;
  editID: string;
  activeID: string;
  className?: string;
  target?: any;
  factory: ACommentFactory;
};

type CommentWrapperProps = {
  commentWidget: ICommentWidget<any>;
  collapseNeeded: Signal<CommentWidget<any>, boolean>;
  className?: string;
};

type ReplyAreaProps = {
  hidden: boolean;
  className?: string;
  comment: IComment;
};

type PreviewProps = {
  comment: IComment;
  target: any;
  factory: ACommentFactory;
};

type ReplyProps = {
  reply: IReply;
  className?: string;
  editable?: boolean;
};

type EmoticonReactionProps = {
  id: string;
};

function EmoticonReaction(props: EmoticonReactionProps): JSX.Element {
  const [open, isOpen] = React.useState(false);
  return (
    <div className="jc-EmoticonReactionWrapper">
      {/* <Jdiv jcEventArea="" id={id}></Jdiv> */}
      {!open && (
        <div onClick={() => isOpen(open => !open)}>
          {emoticonList[0].emoticon}
        </div>
      )}
      {open && (
        <div className="jc-EmoticonReactionOpenWrapper">
          <Jdiv className="jc-EmoticonReactionList">
            {emoticonList.slice(1).map(value => {
              return (
                <Jdiv key={value.id} id={value.id} jcEventArea="emoticon">
                  {value.emoticon}
                </Jdiv>
              );
            })}
          </Jdiv>
          <div onClick={() => isOpen(open => !open)}>
            {emoticonList[0].emoticon}
          </div>
        </div>
      )}

      {/* {!open && (
        <div onClick={() => isOpen(open => !open)}>
          {emoticonDict.Smile.emoticon}
        </div>
      )} */}
      {/* {open && (
        <div className="jc-EmoticonReactionOpenWrapper">
          <Jdiv className="jc-EmoticonReactionList" >
            <Jdiv id={emoticonDict.ThinkingFace.id} jcEventArea="emoticon">{emoticonDict.ThinkingFace.emoticon}</Jdiv>
            <Jdiv id={emoticonDict.ThumbsDown.id}jcEventArea="emoticon">{emoticonDict.ThumbsDown.emoticon}</Jdiv>
            <Jdiv id={emoticonDict.ThumbsUp.id}jcEventArea="emoticon">{emoticonDict.ThumbsUp.emoticon}</Jdiv>
            <Jdiv id={emoticonDict.Eyes.id}jcEventArea="emoticon">{emoticonDict.Eyes.emoticon}</Jdiv>
          </Jdiv>
          <div onClick={() => isOpen(open => !open)}>
            {emoticonDict.Smile.emoticon}
          </div>
        </div>
      )} */}
    </div>
  );
}

function Jdiv(props: any): JSX.Element {
  return <div {...props}>{props.children}</div>;
}

function Jspan(props: any): JSX.Element {
  return <span {...props}>{props.children}</span>;
}

function JCPreview(props: PreviewProps): JSX.Element {
  const { comment, target, factory } = props;

  let previewText = factory.getPreviewText(comment, target);

  return (
    <div className="jc-Preview">
      <div className="jc-PreviewBar" />
      <span className="jc-PreviewText">{previewText}</span>
    </div>
  );
}

/**
 * A React component that renders a single comment or reply.
 *
 * @param comment - the comment object to render. Note: Replies will
 * not be rendered.
 *
 * @param className - a string that will be used as the className of the
 * container element.
 */
function JCComment(props: CommentProps): JSX.Element {
  const comment = props.comment;
  const className = props.className || '';
  const editable = props.editable;
  const target = props.target;
  const factory = props.factory;

  return (
    <Jdiv
      className={'jc-Comment ' + className}
      id={comment.id}
      jcEventArea="other"
    >
      <Jdiv className="jc-CommentProfilePicContainer">
        <Jdiv
          className="jc-CommentProfilePic"
          style={{ backgroundColor: comment.identity.color }}
          jcEventArea="user"
        />
      </Jdiv>
      <span className="jc-Nametag">{comment.identity.name}</span>

      <Jspan className="jc-IconContainer" jcEventArea="dropdown">
        <ellipsesIcon.react className="jc-Ellipses" />
      </Jspan>

      <br />

      <span className="jc-Time">{comment.time}</span>

      {target != null && (
        <JCPreview comment={comment} target={target} factory={factory} />
      )}

      <Jdiv
        className="jc-Body jc-EditInputArea"
        contentEditable={editable}
        suppressContentEditableWarning={true}
        jcEventArea="body"
        onFocus={() => document.execCommand('selectAll', false, undefined)}
      >
        {comment.text}
      </Jdiv>

      <div>
        {comment.emoticons.map(value => {
          return <div key={value.emoticon.id}>{value.emoticon.emoticon}</div>;
        })}
      </div>
    </Jdiv>
  );
}

function JCReply(props: ReplyProps): JSX.Element {
  const reply = props.reply;
  const className = props.className ?? '';
  const editable = props.editable;

  return (
    <Jdiv
      className={'jc-Comment jc-Reply ' + className}
      id={reply.id}
      jcEventArea="other"
    >
      <Jdiv className="jc-ReplyProfilePicContainer">
        <Jdiv
          className="jc-ReplyProfilePic"
          style={{ backgroundColor: reply.identity.color }}
          jcEventArea="user"
        />
      </Jdiv>
      <span className="jc-Nametag">{reply.identity.name}</span>

      <Jspan className="jc-IconContainer" jcEventArea="dropdown">
        <ellipsesIcon.react className="jc-Ellipses" />
      </Jspan>

      <br />

      <span className="jc-Time">{reply.time}</span>

      <Jdiv
        className="jc-Body jc-EditInputArea"
        contentEditable={editable}
        suppressContentEditableWarning={true}
        jcEventArea="body"
        onFocus={() => document.execCommand('selectAll', false, undefined)}
      >
        {reply.text}
      </Jdiv>
      <div>
        {reply.emoticons.map(value => {
          return <div key={value.emoticon.id}>{value.emoticon.emoticon}</div>;
        })}
      </div>
    </Jdiv>
  );
}

function JCCommentWithReplies(props: CommentWithRepliesProps): JSX.Element {
  const comment = props.comment;
  const className = props.className || '';
  const editID = props.editID;
  const target = props.target;
  const factory = props.factory;
  const [open, SetOpen] = React.useState(false);
  const collapseNeeded = props.collapseNeeded;

  let RepliesComponent = (): JSX.Element => {
    collapseNeeded.connect((_, args) => {
      SetOpen(args);
    });

    if (open === true || comment.replies.length < 4) {
      return (
        <div className={'jc-Replies'}>
          {comment.replies.map(reply => (
            <JCReply
              reply={reply}
              editable={editID === reply.id}
              key={reply.id}
            />
          ))}
        </div>
      );
    } else {
      return (
        <div className={'jc-Replies'}>
          <div onClick={handleClick} className="jc-Replies-breaker">
            <div className="jc-Replies-breaker-left">expand thread</div>
            <div className="jc-Replies-breaker-right">
              <div className="jc-Replies-breaker-number">
                {comment.replies.length - 1}
              </div>
              <hr />
              <hr />
            </div>
          </div>
          <JCReply
            reply={comment.replies[comment.replies.length - 1]}
            editable={editID === comment.replies[comment.replies.length - 1].id}
            key={comment.replies[comment.replies.length - 1].id}
          />
        </div>
      );
    }
  };

  React.useEffect(() => {
    //
  }, [open]);

  const handleClick = () => {
    SetOpen(open => !open);
  };

  return (
    <Jdiv className={'jc-CommentWithReplies ' + className}>
      <JCComment
        comment={comment}
        editable={editID === comment.id}
        target={target}
        factory={factory}
      />
      <RepliesComponent />
    </Jdiv>
  );
}

function JCReplyArea(props: ReplyAreaProps): JSX.Element {
  const hidden = props.hidden;
  const className = props.className || '';
  const comment = props.comment;

  return (
    <div>
      <Jdiv hidden={hidden}>
        <Jdiv className="jc-ReplyInputAreaWrapper">
          <EmoticonReaction id={comment.id} />
          <Jdiv
            className={'jc-ReplyInputArea ' + className}
            contentEditable={true}
            jcEventArea="reply"
            onFocus={() => document.execCommand('selectAll', false, undefined)}
            data-placeholder="reply"
          />
        </Jdiv>
      </Jdiv>
    </div>
  );
}

function JCCommentWrapper(props: CommentWrapperProps): JSX.Element {
  const commentWidget = props.commentWidget;
  const className = props.className || '';

  const eventHandler = commentWidget.handleEvent.bind(commentWidget);
  const collapseNeeded = props.collapseNeeded;

  return (
    <div className={className} onClick={eventHandler} onKeyDown={eventHandler}>
      <JCCommentWithReplies
        comment={commentWidget.comment!}
        editID={commentWidget.editID}
        activeID={commentWidget.activeID}
        target={commentWidget.target}
        factory={commentWidget.factory}
        collapseNeeded={collapseNeeded}
      />
      <JCReplyArea
        hidden={commentWidget.replyAreaHidden}
        comment={commentWidget.comment!}
      />
    </div>
  );
}

export interface ICommentWidget<T> {
  revealReply: () => void;
  openEditActive: () => void;
  editActive: (text: string) => void;
  deleteActive: () => void;
  comment: IComment | undefined;
  target: T;
  replies: IReply[] | undefined;
  commentID: string;
  identity: IIdentity | undefined;
  text: string | undefined;
  type: string | undefined;
  menu: Menu | undefined;
  replyAreaHidden: boolean;
  activeID: string;
  editID: string;
  factory: ACommentFactory;
  renderNeeded: ISignal<this, undefined>;
  handleEvent: (event: React.SyntheticEvent | Event) => void;
}

/**
 * A React widget that can render a comment and its replies.
 */
export class CommentWidget<T> extends ReactWidget implements ICommentWidget<T> {
  constructor(options: CommentWidget.IOptions<T>) {
    super();

    const { id, target, model, factory } = options;
    this._commentID = id;
    this._activeID = id;
    this._target = target;
    this._factory = factory;
    this._model = model;

    this.addClass('jc-CommentWidget');
    this.node.tabIndex = 0;
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.node.addEventListener('focusout', this);
  }

  protected onAfterDetach(msg: Message): void {
    super.onAfterAttach(msg);
    this.node.removeEventListener('focusout', this);
  }

  handleEvent(event: React.SyntheticEvent | Event): void {
    switch (event.type) {
      case 'click':
        this._handleClick(event as React.MouseEvent);
        break;
      case 'keydown':
        this._handleKeydown(event as React.KeyboardEvent);
        break;
      case 'focusout':
        this._handleBlur(event as React.MouseEvent);
        break;
    }
  }

  /**
   * Handle `click` events on the widget.
   */
  protected _handleClick(event: React.MouseEvent): void {
    switch (CommentWidget.getEventArea(event)) {
      case 'body':
        this._handleBodyClick(event);
        break;
      case 'dropdown':
        this._handleDropdownClick(event);
        break;
      case 'reply':
        this._handleReplyClick(event);
        break;
      case 'user':
        this._handleUserClick(event);
        break;
      case 'emoticon':
        this._handleEmoticonClick(event);
        break;
      case 'other':
        this._handleOtherClick(event);
        break;

      case 'none':
        break;
      default:
        break;
    }
  }

  private _handleEmoticonClick(event: React.MouseEvent) {
    this._setClickFocus(event);
    const target = event.target as HTMLDivElement;
    console.log(target.id);
    // console.log((this.model.toJSON() as PartialJSONObject)['emoticons'])
    console.log(this.model.toString());
    const temp: Emoticon = getEmoticonByID(target.id);
    console.log(temp);
    if (temp === undefined) {
      console.warn('Did not recieve a emoticon with the id');
      return;
    }

    let oldEmoticonList = this.model.getComment(this.activeID)?.comment
      .emoticons;
    if (oldEmoticonList == undefined) {
      oldEmoticonList = this.model.getReply(this.activeID)!.reply.emoticons;
    }

    // let oldEmoticonList: IEmoticon[] = this.model.getComment(this.activeID)!.comment.emoticons

    let newEmoticon: IEmoticon = {
      emoticon: temp,
      user: this.identity!
    };

    oldEmoticonList.push(newEmoticon);
    console.log('New emoticon list', oldEmoticonList);

    try {
      this.model.editComment(
        {
          emoticons: oldEmoticonList
        },
        this.activeID
      );
    } catch {
      this.model.editReply(
        {
          emoticons: oldEmoticonList
        },
        this.activeID
      );
    }
  }

  private _handleBlur(event: React.MouseEvent): void {
    const relatedTarget = event.relatedTarget;
    event.preventDefault();
    event.stopPropagation();
    if (relatedTarget == null) {
      this.collapseNeeded.emit(false);
    } else if (
      !this.node.contains(relatedTarget as HTMLElement) ||
      !(this.node === relatedTarget)
    ) {
      this.collapseNeeded.emit(false);
    }
  }

  /**
   * Sets the widget focus and active id on click.
   *
   * A building block of other click handlers.
   */
  private _setClickFocus(event: React.MouseEvent): void {
    const oldActive = document.activeElement;
    const target = event.target as HTMLElement;
    const clickID = Private.getClickID(target);

    if (clickID != null) {
      this.activeID = clickID;
    }

    if (oldActive == null || !this.node.contains(oldActive)) {
      this.node.focus();
    }
  }

  /**
   * Handle a click on the dropdown (ellipses) area of a widget.
   */
  protected _handleDropdownClick(event: React.MouseEvent): void {
    this._setClickFocus(event);
    const menu = this.menu;
    if (menu != null) {
      menu.open(event.pageX, event.pageY);
    }
  }

  /**
   * Handle a click on the user icon area of a widget.
   *
   * ### Note
   * Currently just acts as an `other` click.
   */
  protected _handleUserClick(event: React.MouseEvent): void {
    console.log('clicked user photo!');
    this._setClickFocus(event);
  }

  /**
   * Handle a click on the widget but not on a specific area.
   */
  protected _handleOtherClick(event: React.MouseEvent): void {
    this._setClickFocus(event);

    const target = event.target as HTMLElement;
    const clickID = Private.getClickID(target);
    if (clickID == null) {
      return;
    }

    this.editID = '';

    if (this.replyAreaHidden) {
      this.revealReply();
    } else {
      this.replyAreaHidden = true;
    }
  }

  /**
   * Handle a click on the widget's reply area.
   */
  protected _handleReplyClick(event: React.MouseEvent): void {
    this._setClickFocus(event);
  }

  /**
   * Handle a click on the widget's body.
   */
  protected _handleBodyClick(event: React.MouseEvent): void {
    this._setClickFocus(event);
    this.openEditActive();
  }

  /**
   * Handle `keydown` events on the widget.
   */
  protected _handleKeydown(event: React.KeyboardEvent): void {
    switch (CommentWidget.getEventArea(event)) {
      case 'reply':
        this._handleReplyKeydown(event);
        break;
      case 'body':
        this._handleBodyKeydown(event);
        break;
      default:
        break;
    }
  }

  /**
   * Handle a keydown on the widget's reply area.
   */
  protected _handleReplyKeydown(event: React.KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.replyAreaHidden = true;
      return;
    } else if (event.key !== 'Enter') {
      return;
    } else if (event.shiftKey) {
      return;
    }

    const target = event.target as HTMLDivElement;
    event.preventDefault();
    event.stopPropagation();

    this.model.addReply(
      {
        identity: getIdentity(this.model.awareness),
        text: target.innerText
      },
      this.commentID
    );

    target.textContent = '';
    this.replyAreaHidden = true;
  }

  /**
   * Handle a keydown on the widget's body.
   */
  protected _handleBodyKeydown(event: React.KeyboardEvent): void {
    if (this.editID === '') {
      return;
    }

    const target = event.target as HTMLDivElement;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        target.innerText = this.text!;
        this.editID = '';
        target.blur();
        break;
      case 'Enter':
        if (event.shiftKey) {
          break;
        }
        event.preventDefault();
        event.stopPropagation();
        if (target.innerText === '') {
          target.innerText = this.text!;
        } else {
          this.editActive(target.innerText);
        }
        this.editID = '';
        target.blur();
        break;
      default:
        break;
    }
  }

  render(): ReactRenderElement {
    return (
      <UseSignal signal={this.renderNeeded}>
        {() => (
          <JCCommentWrapper
            commentWidget={this}
            collapseNeeded={this._collapseNeeded}
          />
        )}
      </UseSignal>
    );
  }

  /**
   * Open the widget's reply area and focus on it.
   */
  revealReply(): void {
    if (this.isAttached === false) {
      return;
    }

    this.replyAreaHidden = false;
    const nodes = this.node.getElementsByClassName(
      'jc-ReplyInputArea'
    ) as HTMLCollectionOf<HTMLDivElement>;
    nodes[0].focus();
  }

  /**
   * Select the body area of the currently active comment for editing.
   */
  openEditActive(): void {
    if (this.isAttached === false) {
      return;
    }

    const comment = document.getElementById(this.activeID);
    if (comment == null) {
      return;
    }

    this.editID = this.activeID;
    const elements = comment.getElementsByClassName(
      'jc-Body'
    ) as HTMLCollectionOf<HTMLDivElement>;
    const target = elements[0];
    target.focus();
  }

  editActive(text: string): void {
    if (this.activeID === this.commentID) {
      this.model.editComment({ text }, this.commentID);
    } else {
      this.model.editReply({ text }, this.activeID, this.commentID);
    }
  }

  /**
   * Delete the currently active comment or reply.
   *
   * ### Notes
   * If the base comment is deleted, the widget will be disposed.
   */
  deleteActive(): void {
    if (this.isAttached === false) {
      return;
    }

    if (this.activeID === this.commentID) {
      this.model.deleteComment(this.commentID);
      this.dispose();
    } else {
      this.model.deleteReply(this.activeID, this.commentID);
    }
  }

  /**
   * The comment object being rendered by the widget.
   */
  get comment(): IComment | undefined {
    return this.model.getComment(this.commentID)?.comment;
  }

  /**
   * The target of the comment (what is being commented on).
   */
  get target(): T {
    return this._target;
  }

  /**
   * Information about the author of the comment.
   */
  get identity(): IIdentity | undefined {
    return this.comment?.identity;
  }

  /**
   * The type of the comment.
   */
  get type(): string | undefined {
    return this.comment?.type;
  }

  /**
   * The plain body text of the comment.
   */
  get text(): string | undefined {
    return this.comment?.text;
  }

  /**
   * An array of replies to the comment.
   */
  get replies(): IReply[] | undefined {
    return this.comment?.replies;
  }

  /**
   * The ID of the main comment.
   */
  get commentID(): string {
    return this._commentID;
  }

  get model(): CommentFileModel {
    return this._model;
  }

  /**
   * The ID of the last-focused comment or reply.
   */
  get activeID(): string {
    return this._activeID;
  }
  set activeID(newVal: string) {
    if (newVal !== this.activeID) {
      this._activeID = newVal;
      this._renderNeeded.emit(undefined);
    }
  }

  /**
   * Whether to show the reply area or not
   */
  get replyAreaHidden(): boolean {
    return this._replyAreaHidden;
  }
  set replyAreaHidden(newVal: boolean) {
    if (newVal !== this.replyAreaHidden) {
      this._replyAreaHidden = newVal;
      this._renderNeeded.emit(undefined);
    }
  }

  /**
   * A signal emitted when a React re-render is required.
   */
  get renderNeeded(): Signal<this, undefined> {
    return this._renderNeeded;
  }

  get collapseNeeded(): Signal<this, boolean> {
    return this._collapseNeeded;
  }

  /**
   * The ID of the managed comment being edited, or the empty string if none.
   */
  get editID(): string {
    return this._editID;
  }
  set editID(newVal: string) {
    if (this.editID !== newVal) {
      this._editID = newVal;
      this._renderNeeded.emit(undefined);
    }
  }

  get factory(): ACommentFactory {
    return this._factory;
  }

  get menu(): Menu | undefined {
    return this.model.commentMenu;
  }

  private _model: CommentFileModel;
  private _commentID: string;
  private _target: T;
  private _activeID: string;
  private _replyAreaHidden: boolean = true;
  private _editID: string = '';
  private _factory: ACommentFactory;
  private _renderNeeded: Signal<this, undefined> = new Signal<this, undefined>(
    this
  );
  private _collapseNeeded: Signal<this, boolean> = new Signal<this, boolean>(
    this
  );
}

export namespace CommentWidget {
  export interface IOptions<T> {
    id: string;
    model: CommentFileModel;

    target: T;

    factory: ACommentFactory;
  }

  /**
   * A type referring to an area of a `CommentWidget`
   */
  export type EventArea =
    | 'dropdown'
    | 'body'
    | 'user'
    | 'reply'
    | 'other'
    | 'emoticon'
    | 'blur'
    | 'none';

  /**
   * Whether a string is a type of `EventArea`
   */
  export function isEventArea(input: string): input is EventArea {
    return [
      'dropdown',
      'body',
      'user',
      'reply',
      'other',
      'emoticon',
      'none',
      'blur'
    ].includes(input);
  }

  /**
   * Gets the `EventArea` of an event on a `CommentWidget`.
   *
   * Returns `none` if the event has no ancestors with the `jcEventArea` attribute,
   * and returns `other` if `jcEventArea` is set but the value is unrecognized.
   *
   * ### Notes
   * Also sets the target of the event to the first ancestor of the target with
   * the `jcEventArea` attribute set.
   */
  export function getEventArea(event: React.SyntheticEvent): EventArea {
    const target = event.target as HTMLElement;
    const areaElement = target.closest('[jcEventArea]');
    if (areaElement == null) {
      return 'none';
    }

    const area = areaElement.getAttribute('jcEventArea');
    if (area == null) {
      return 'other';
    }

    event.target = areaElement;

    return isEventArea(area) ? area : 'other';
  }
}

export namespace MockCommentWidget {
  export interface IOptions<T> {
    model: CommentFileModel;
    factory: ACommentFactory;
    target: T;
    comment: IComment;
  }
}

export class MockCommentWidget<T> extends CommentWidget<T> {
  constructor(options: MockCommentWidget.IOptions<T>) {
    super({ ...options, id: options.comment.id });

    const comment = options.comment;

    this._comment = comment;

    const commands = this.model.commentMenu?.commands;
    if (commands == null) {
      return;
    }

    this._menu = new Menu({ commands });
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.openEditActive();
  }

  protected onAfterDetach(msg: Message): void {
    super.onAfterDetach(msg);
  }

  populate(text: string): void {
    let index = 0;
    let node = this.node as ChildNode;
    while (node.previousSibling != null) {
      index++;
      node = node.previousSibling;
    }

    this.hide();

    const { target, identity, type } = this.comment;

    this.model.insertComment(
      {
        text,
        identity,
        type,
        target
      },
      index
    );

    this.dispose();
  }

  protected _handleBodyKeydown(event: React.KeyboardEvent): void {
    if (this.editID === '') {
      return;
    }

    const target = event.target as HTMLDivElement;

    switch (event.key) {
      case 'Escape':
        this.dispose();
        break;
      case 'Enter':
        if (event.shiftKey) {
          break;
        }
        if (target.innerText === '') {
          this.dispose();
        } else {
          this.populate(target.innerText);
        }
        break;
      default:
        break;
    }
  }

  get comment(): IComment {
    return this._comment;
  }

  get menu(): Menu | undefined {
    return this._menu;
  }

  private _comment: IComment;
  private _menu: Menu | undefined;
}

/**
 * A widget that hosts and displays a list of `CommentWidget`s
 */
export class CommentFileWidget extends Panel {
  constructor(options: CommentFileWidget.IOptions) {
    super();

    const { context } = options;
    this._context = context;
    this._model = context.model as CommentFileModel;

    this.id = `Comments-${context.path}`;
    this.addClass('jc-CommentFileWidget');

    const content = new Panel();
    content.addClass('jc-CommentFileWidgetChild');
  }

  insertComment(comment: IComment, index: number): void {
    const factory = this.model.registry.getFactory(comment.type);
    if (factory == null) {
      return;
    }

    const widget = factory.createWidget(comment, this.model);

    if (widget != null) {
      this.insertWidget(index, widget);
      this._commentAdded.emit(widget);
    }
  }

  onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);

    while (this.widgets.length > 0) {
      this.widgets[0].dispose();
    }

    this.model.comments.forEach(comment => this.addComment(comment));
  }

  addComment(comment: IComment) {
    const factory = this.model.registry.getFactory(comment.type);
    if (factory == null) {
      return;
    }

    const widget = factory.createWidget(comment, this.model);

    if (widget != null) {
      this.addWidget(widget);
      this._commentAdded.emit(widget);
    }
  }

  get model(): CommentFileModel {
    return this._model;
  }

  get context(): Context {
    return this._context;
  }

  get commentAdded(): ISignal<this, CommentWidget<any>> {
    return this._commentAdded;
  }

  private _model: CommentFileModel;
  private _context: Context;
  private _commentAdded = new Signal<this, CommentWidget<any>>(this);
}

export namespace CommentFileWidget {
  export interface IOptions {
    context: Context;
  }

  export interface IBaseMockCommentOptions {
    identity: IIdentity;
    type: string;
  }

  export type IMockCommentOptions = (
    | { target: PartialJSONValue }
    | { source: any }
  ) &
    IBaseMockCommentOptions;
}

export namespace Private {
  /**
   * Get the ID of a comment that a target lies within.
   */
  export function getClickID(target: HTMLElement): string | undefined {
    const comment = target.closest('.jc-Comment');
    if (comment == null) {
      return undefined;
    }
    return comment.id;
  }
}
