import React from "react";
import { ArticleType } from "./NewsFeedPage";
import { CommentsList } from "./CommentsList";

type ArticlePropsType = {
  articleId: number;
};
export const Article = React.forwardRef((props: ArticlePropsType, ref: any) => {
  const [article, setArticle] = React.useState<ArticleType | null>(null);
  React.useEffect(() => {
    fetchArticleById(props.articleId).then((a) => setArticle(a));
  }, []);

  const fetchArticleById = async (id: number) => {
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    return response.json() as Promise<ArticleType>;
  };

  if (!article) {
    return null;
  }

  const addBookmark = (articleID: number) => {
    let data = localStorage.getItem("articleIds");

    if (data) {
      let articleIdArray = JSON.parse(String(data));
      articleIdArray.push(articleID);
      localStorage.setItem("articleIds", JSON.stringify(articleIdArray));
    } else {
      localStorage.setItem("articleIds", "[" + articleID + "]");
    }
  };

  return (
    <article ref={ref} className="container article">
      <div className="article-heading">
        <h3 className="article-title">
          <a href={article.url}>{article.title}</a>
        </h3>
        <div className="article-info-container">
          <label htmlFor="author" className="author-label">
            By:
          </label>
          <p className="article-author">{article.by}</p>
          <button
            className="bookmark-button"
            onClick={() => {
              addBookmark(props.articleId);
            }}
          >
            Bookmark
          </button>
        </div>
      </div>

      <CommentsList commentIds={article.kids || []} />
    </article>
  );
});
