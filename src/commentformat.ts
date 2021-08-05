/* eslint-disable @typescript-eslint/naming-convention */
import { CodeEditor } from '@jupyterlab/codeeditor';
import { PartialJSONValue } from '@lumino/coreutils';

/**
 * A type for the identity of a commentor.
 */
export interface IIdentity {
  id: number;
  name: string;
  color: string;
}

// interface Smile {
//   name: 'Smile';
//   emoticon: '😀';
//   id: 'U+1F600'
// }
// interface ThumbsUp {
//   name: 'ThumbsUp';
//   emoticon: '👍';
//   id: 'U+1F44D'
// }
// interface ThumbsDown {
//   name: 'ThumbsDown';
//   emoticon: '👎';
//   id: 'U+1F44E'
// }
// interface Eyes {
//   name: 'Eyes';
//   emoticon: '👀';
//   id: 'U+1F440'
// }
// interface ThinkingFace {
//   name: 'ThinkingFace';
//   emoticon: '🤔';
//   id: 'U+1F914'
// }

export const emoticonList = [
  {
    emoticon: '😀',
    id: 'U+1F600'
  },
  {
    emoticon: '👍',
    id: 'U+1F44D'
  },
  {
    emoticon: '👎',
    id: 'U+1F44E'
  },
  {
    emoticon: '👀',
    id: 'U+1F440'
  },
  {
    emoticon: '🤔',
    id: 'U+1F914'
  }
]

// export const emoticonDict = {
//   Smile: {
//     emoticon: '😀',
//     id: 'U+1F600'
//   },
//   ThumbsUp: {
//     emoticon: '👍',
//     id: 'U+1F44D'
//   },
//   ThumbsDown: {
//     emoticon: '👎',
//     id: 'U+1F44E'
//   },
//   Eyes: {
//     emoticon: '👀',
//     id: 'U+1F440'
//   },
//   ThinkingFace: {
//     emoticon: '🤔',
//     id: 'U+1F914'
//   }
// };

export type Emoticon = {
  emoticon: '😀' | '👍' | '👎' | '👀' |'🤔' 
  id: string
}

export function getEmoticonByID(id: string): Emoticon{
  let emoticon : Emoticon;
  emoticonList.map((emoji) => {
    if (emoji['id'] == id) {
      emoticon = emoji as Emoticon;
      console.log(emoticon)
      return emoticon
    }
  });

  emoticon = emoticonList[0] as Emoticon
  return emoticon
}

// type Emoticon = Smile | ThumbsDown | ThinkingFace | ThumbsUp | Eyes;

export interface IEmoticon {
  emoticon: Emoticon;
  user: IIdentity;
}

/**
 * A type for the properties of a text selection
 */
export interface ISelection extends IComment {
  start: CodeEditor.IPosition;
  end: CodeEditor.IPosition;
}

export interface IBaseComment {
  id: string;
  type: string;
  identity: IIdentity;
  emoticons: IEmoticon[];
  text: string;
  time: string;
}

export interface IReply extends IBaseComment {
  type: 'reply';
}

export interface ICommentWithReplies extends IBaseComment {
  replies: IReply[];
}

export interface IComment extends ICommentWithReplies {
  target: PartialJSONValue;
}

export interface ICellComment extends IComment {
  type: 'cell';
  target: {
    cellID: string;
  };
}

export interface ICellSelectionComment extends IComment {
  type: 'cell-selection';
  target: {
    cellID: string;
    start: CodeEditor.IPosition;
    end: CodeEditor.IPosition;
  };
}
