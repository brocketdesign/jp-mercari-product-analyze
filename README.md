# jp-mercari-product-analyze
The Mercari Market App is an Express-based web application that interacts with a MongoDB database to fetch and display market data, including products and best sellers. Users can search for products by keyword, view daily results, and refresh data using integrated scraper and best-seller modules.
---

**Mercari Market App**

This app is designed to interact with a MongoDB database to fetch and display data related to the Mercari Market. The main functionalities provided by the app's routes are:

1. **Homepage (`/`)**:
   - Fetches and displays results from the database collection named 'results_' followed by the current date.
   - Renders the 'index' view with the title 'Mercari Market' and the fetched data.

2. **Products Page (`/products`)**:
   - Fetches and displays products from the database collection named 'products_' followed by the current date.
   - Renders the 'products' view with the title 'Mercari Market' and the filtered products.

3. **Results Page (`/result`)**:
   - Fetches results from the database collection named 'results_' followed by either the provided date or the current date.
   - Sends the fetched results as a response.

4. **Keyword Search (`/keyword/:keyword` and `/keyword/`)**:
   - Allows users to search for products by keyword.
   - Fetches products that include the specified keyword in their title.
   - For the GET route, it renders the 'best' view with statistics like total products, total sales, and average sales.
   - For the POST route, it sends the total sales as a response.

5. **Best Sellers Page (`/best`)**:
   - Fetches and displays the best-selling products from the database collection named 'best_' followed by the current date.
   - Renders the 'best' view with the title '売れ筋ランキング' (Best Sellers Ranking) and the fetched data.

6. **Refresh Data (`/refresh`)**:
   - Invokes the scraper and bestSeller modules to refresh the data in the database.
   - Redirects back to the previous page after refreshing the data.

Additionally, there are utility functions provided:
- **Date and Time Utilities**: Functions to get the current date and time in specific formats.
- **MongoDB Utilities**: Demonstrative functions to interact with a MongoDB collection named 'meigara'. These functions showcase basic CRUD operations like fetching, inserting, updating, and deleting documents.

---

Note: The app uses the Express framework and connects to a MongoDB database. It also uses middleware like `body-parser` for parsing request bodies and has error handling in place for potential issues during database operations.
