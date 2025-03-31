import { useEffect, useState } from "react";
import styles from "./ArticleList.module.css";

interface Article {
  id: string;
  title: string;
  author: string;
  image: string;
  tags: string[];
}

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/jsonapi/node/article")
      .then((response) => response.json())
      .then((data) => {
        const included = data.included || [];

        const getAuthorName = (id: string) => {
          const author = included.find((item: any) => item.type === "user--user" && item.id === id);
          return author ? author.attributes.name : "Unknown";
        };

        const getImageUrl = (id: string) => {
          const image = included.find((item: any) => item.type === "file--file" && item.id === id);
          return image ? `http://localhost:8080${image.attributes.uri.url}` : "";
        };

        const getTagNames = (tagIds: string[]) => {
          return tagIds
            .map((id) => {
              const tag = included.find((item: any) => item.type === "taxonomy_term--tags" && item.id === id);
              return tag ? tag.attributes.name : "Unknown Tag";
            })
            .filter(Boolean);
        };

        const formattedArticles = data.data.map((item: any) => ({
          id: item.id,
          title: item.attributes.title,
          author: getAuthorName(item.relationships.field_author?.data?.id || ""),
          image: getImageUrl(item.relationships.field_image?.data?.id || ""),
          tags: getTagNames(item.relationships.field_tags?.data?.map((tag: any) => tag.id) || []),
        }));

        setArticles(formattedArticles);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      {loading
        ? Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={styles.skeleton}></div>
          ))
        : articles.map((article) => (
            <div key={article.id} className={styles.card}>
              {article.image && <img src={article.image} alt={article.title} className={styles.image} />}
              <h2 className={styles.title}>{article.title}</h2>
              <div className={styles.authorSection}>
                <div className={styles.avatar}></div>
                <span className={styles.author}>{article.author}</span>
              </div>
              <div className={styles.tags}>
                {article.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
    </div>
  );
}