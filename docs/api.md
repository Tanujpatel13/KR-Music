# KR Music API Documentation

All API endpoints are prefixed with `/api` and expect JSON content bodies unless noted.

---

## Authentication Endpoints

### 1. Register User
* **Method**: `POST`
* **Path**: `/api/auth/register`
* **Request Body**:
  ```json
  {
    "email": "user@krmusic.com",
    "username": "KRListener",
    "password": "password123",
    "role": "USER" // "USER", "ARTIST", "ADMIN"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "uuid-string",
      "email": "user@krmusic.com",
      "username": "KRListener",
      "role": "USER"
    }
  }
  ```

### 2. Login User
* **Method**: `POST`
* **Path**: `/api/auth/login`
* **Request Body**:
  ```json
  {
    "emailOrUsername": "user@krmusic.com",
    "password": "password123"
  }
  ```
* **Response (200 OK)**: Sets a secure `refreshToken` in HttpOnly cookies and returns:
  ```json
  {
    "message": "Logged in successfully",
    "accessToken": "eyJhbGciOi...",
    "user": { "id": "uuid", "email": "...", "username": "...", "role": "USER" }
  }
  ```

---

## Songs & Playback Endpoints

### 1. Get Homepage Feed
* **Method**: `GET`
* **Path**: `/api/songs/home`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Response (200 OK)**:
  ```json
  {
    "recentlyPlayed": [...],
    "recommendedSongs": [...],
    "newReleases": [...],
    "topCharts": [...],
    "podcasts": [...],
    "favoriteArtists": [...]
  }
  ```

### 2. Increment Play Count
* **Method**: `POST`
* **Path**: `/api/songs/:songId/play`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Response (200 OK)**:
  ```json
  {
    "message": "Playback registered",
    "playCount": 24
  }
  ```

### 3. Toggle Favorite (Like Song)
* **Method**: `POST`
* **Path**: `/api/songs/:songId/favorite`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Response (200 OK)**:
  ```json
  {
    "liked": true // or false if unliked
  }
  ```

---

## Playlists Endpoints

### 1. Create Playlist
* **Method**: `POST`
* **Path**: `/api/playlists`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Request Body**:
  ```json
  {
    "name": "Focus Beats",
    "description": "Chill sounds",
    "isPublic": true,
    "isCollaborative": false
  }
  ```

### 2. Add Song to Playlist
* **Method**: `POST`
* **Path**: `/api/playlists/:playlistId/songs`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Request Body**:
  ```json
  {
    "songId": "song-uuid-here"
  }
  ```

---

## Search Endpoints

### 1. Advanced Search
* **Method**: `GET`
* **Path**: `/api/search`
* **Query Parameters**:
  * `q` (string, required) - search term
  * `genre` (string) - filter by genre
  * `language` (string) - filter by language
  * `year` (number) - filter by release year
* **Response (200 OK)**:
  ```json
  {
    "songs": [...],
    "artists": [...],
    "albums": [...],
    "playlists": [...],
    "podcasts": [...]
  }
  ```

---

## Billing & Premium Endpoints

### 1. Stripe Checkout Session
* **Method**: `POST`
* **Path**: `/api/payments/checkout`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Request Body**:
  ```json
  {
    "planType": "PREMIUM_INDIVIDUAL" // "PREMIUM_INDIVIDUAL", "PREMIUM_FAMILY", "PREMIUM_STUDENT"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/..."
  }
  ```
