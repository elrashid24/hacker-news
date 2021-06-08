import React from "react";
import { useHistory } from "react-router-dom";
import { ArticleType } from "./NewsFeedPage";
import { CommentsList } from "./CommentsList";

export function BookMarks() {
  const [articles, setArticles] = React.useState<ArticleType[]>([]);
  const history = useHistory();
  React.useEffect(() => {
    let articlePromises: Promise<ArticleType>[] = [];
    const articleIds = localStorage.getItem("articleIds");
    if (articleIds) {
      let ids = JSON.parse(articleIds);

      for (const id of ids) {
        articlePromises.push(fetchBookMarkedArticle(id));
      }
      Promise.all(articlePromises).then((resolvedArticle) =>
        setArticles(resolvedArticle)
      );
    } else {
      return;
    }
  }, []);

  const fetchBookMarkedArticle = async (id: number) => {
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
    );
    return response.json() as Promise<ArticleType>;
  };

  const returnHome = () => {
    history.push("/");
    return;
  };

  return (
    <article>
      <div className="bookmark-header-container">
        <h1>My Bookmarks</h1>
      </div>{" "}
      <button className="view-bookmarks" onClick={returnHome}>
        All Articles
      </button>
      {articles.map((article) => {
        return article ? (
          <div className="container article">
            <div className="article-heading">
              <h3 className="article-title">
                <a href={article.url}>{article.title}</a>
              </h3>
              <div className="article-info-container">
                <label htmlFor="author" className="author-label">
                  By:
                </label>
                <p className="article-author">{article.by}</p>
              </div>
            </div>

            <CommentsList commentIds={article.kids || []} />
          </div>
        ) : null;
      })}
    </article>
  );
}
