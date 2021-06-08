import React from "react";
import chunk from "lodash/chunk";
import { Article } from "./Article";
import { useInView } from "react-intersection-observer";
import { useHistory, useLocation } from "react-router-dom";

// API types
export type ArticleType = {
  id: number;
  by: string;
  descendants: number;
  score: number;
  time: number;
  type: string;
  url: string;
  title: string;
  kids?: number[];
};

export type CommentType = {
  by: string;
  id: number;
  kids: number[];
  parent: string;
  time: number;
  type: string;
  text: string;
};
// State Types
type ChunkedArticleIdsType = number[][];
// In a real app, I would probably have more explicity statuses per API call.
type Status = "loading" | "ok" | "error";

type StateType = {
  status: Status;
  chunkedArticleIds: ChunkedArticleIdsType;
  renderedChunks: { [chunkId: string]: string };
  currentPageIndex: number | null;
};

const initialState: StateType = {
  status: "loading",
  chunkedArticleIds: [],
  renderedChunks: {},
  currentPageIndex: null,
};

function newsReducer(state: StateType, action: any): StateType {
  switch (action.type) {
    case "fetch_article_ids_success":
      return {
        ...state,
        chunkedArticleIds: action.chunkedArticleIds,
        currentPageIndex: action.currentPageIndex,
      };

    case "get_next_articles":
      return {
        ...state,
        renderedChunks: {
          ...state.renderedChunks,
          [action.nextChunk]: action.nextChunk,
        },
        status: "ok",
      };

    case "get_previous_articles":
      return {
        ...state,
        renderedChunks: {
          ...state.renderedChunks,
          [action.previousChunk]: action.previousChunk,
        }, // [0, 1]
        currentPageIndex: action.previousChunk, // 0
        status: "ok",
      };

    case "get_next_page":
      return {
        ...state,
        currentPageIndex: action.nextPageIndex,
      };

    default:
      return state;
  }
}

export const NewsFeedPage = () => {
  const [state, dispatch] = React.useReducer(newsReducer, initialState);
  const { ref, inView } = useInView();
  const history = useHistory();
  const location = useLocation();

  // On mount
  React.useEffect(() => {
    handleFetchAllArticleIds();
  }, []);
  // on mount & when currentPageIndexChanges
  React.useEffect(() => {
    if (state.currentPageIndex !== null) {
      handleRenderArticles(state.currentPageIndex);
      updateURLSearchParams(state.currentPageIndex);
    }
  }, [state.currentPageIndex]);
  // When the last article is in the view.
  React.useEffect(() => {
    if (inView && state.currentPageIndex !== null) {
      dispatch({
        type: "get_next_page",
        nextPageIndex: state.currentPageIndex + 1,
      });
    }
  }, [inView]);

  const handleFetchAllArticleIds = async () => {
    try {
      const articleIds = await fetchAllArticleIds();
      const chunked = chunk<number>(articleIds, 10);
      const urlSearchParams = new URLSearchParams(location.search);
      const page = urlSearchParams.get("page");
      const nextPageIndex = page ? parseInt(page) : 0;
      dispatch({
        type: "fetch_article_ids_success",
        chunkedArticleIds: chunked,
        currentPageIndex: nextPageIndex,
      });
      return;
    } catch {
      // TODO dispatch error action
      return;
    }
  };
  const fetchAllArticleIds = async () => {
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );
    return response.json() as Promise<number[]>;
  };

  const handleRenderArticles = (chunkIndex: number) => {
    dispatch({ type: "get_next_articles", nextChunk: chunkIndex });
    return;
  };

  const updateURLSearchParams = (currentPageIndex: number) => {
    const params = new URLSearchParams();
    params.append("page", String(currentPageIndex));
    history.push({ search: params.toString() });
    return;
  };

  const handleFetchPrevious = () => {
    if (!state.currentPageIndex) {
      return;
    }
    dispatch({
      type: "get_previous_articles",
      previousChunk: state.currentPageIndex - 1,
    });
    return;
  };

  const isLoading = state.status === "loading";
  const isOk = state.status === "ok";

  const hasPreviousArticles =
    state.currentPageIndex !== null &&
    state.chunkedArticleIds[state.currentPageIndex - 1] !== undefined;

  const fetchBookmarks = () => {
    history.push("/bookmarks");
    return;
  };

  return (
    <div className="container">
      <div className="header-container">
        <h1 className="header">Alternative Hacker News</h1>
        <button className="view-bookmarks" onClick={fetchBookmarks}>
          My Bookmarks
        </button>
      </div>

      {isLoading ? <p>Loading...</p> : null}
      {hasPreviousArticles && (
        <button className="button" onClick={handleFetchPrevious}>
          Load Previous
        </button>
      )}
      {isOk
        ? Object.keys(state.renderedChunks).map((chunkIndex) => {
            const currentChunk = state.chunkedArticleIds[parseInt(chunkIndex)];
            return currentChunk.map((articleId, index) => {
              const isLastArticle = index === currentChunk.length - 1;
              return (
                <Article
                  ref={isLastArticle ? ref : null}
                  key={articleId}
                  articleId={articleId}
                />
              );
            });
          })
        : null}
    </div>
  );
};

// function ArticleList({articleIds}) {
//   return <React.fragment>
//     {articleIds.map(articleId =>)}
//   </React.fragment>
// }
