import React from "react";
import { CommentType } from "./NewsFeedPage";

export function CommentsList({ commentIds }: { commentIds: number[] }) {
  const [comments, setComments] = React.useState<CommentType[]>([]);

  React.useEffect(() => {
    let commentPromises: Promise<CommentType>[] = [];
    for (const commentId of commentIds) {
      commentPromises.push(fetchCommentById(commentId));
    }
    Promise.all(commentPromises).then((resolvedComments) =>
      setComments(resolvedComments)
    );
  }, []);

  const fetchCommentById = async (id: number) => {
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
    );
    return response.json() as Promise<CommentType>;
  };

  return (
    <ul className="comment-list">
      {comments.map((comment) => {
        return comment ? (
          <li className="comment-item" key={comment.id}>
            <span className="comment-author">{comment.by}</span> {comment.text}
          </li>
        ) : null;
      })}
    </ul>
  );
}
