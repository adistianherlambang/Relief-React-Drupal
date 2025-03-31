# React + TypeScript + Vite Frontend for Drupal Articles

This project is a **small frontend** built with **React, TypeScript, and Vite** to fetch and display articles exposed via Drupal's **JSON:API**.

## 📌 Features
- **Fetches articles** from a Drupal 10 backend.
- **Lists articles** with title, image, author, and tags.
- **Uses Vite** for fast development.
- **Proxy setup** to handle API requests.

## 📋 Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- A running **Drupal 10 JSON:API** instance

## 🚀 How to Use
### 1. Clone the Repository
```sh
git clone https://github.com/username/react-drupal-frontend.git
cd react-drupal-frontend
```

### 2. Install Dependencies
```sh
yarn install
# or
npm install
```

### 3. Start the Development Server
```sh
yarn dev
# or
npm run dev
```
This will start the frontend on **http://localhost:5173**.

## 📡 API Integration
The application fetches articles from **Drupal's JSON:API** at:
```
http://localhost:8080/jsonapi/node/article
```
This is configured in `vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/jsonapi': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

## 📜 Fetching Articles
The `ArticleList.tsx` component handles fetching and displaying articles:
```tsx
useEffect(() => {
    fetch("/jsonapi/node/article") //<<=here
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
```

## 📌 Project Structure
```
├── src/
│   ├── components/
│   │   ├── ArticleList.tsx  # Fetch and display articles
│   ├── App.tsx              # Main app entry point
│   ├── main.tsx             # React entry file
├── vite.config.ts           # API proxy settings
├── package.json             # Dependencies
├── README.md                # Documentation
```

## 🛠 Troubleshooting
- **Check Vite logs**
  ```sh
  yarn dev
  ```
- **Ensure Drupal's JSON:API is enabled**
- **Verify API response at** `http://localhost:8080/jsonapi/node/article`

---

**Happy Coding! 🚀**

