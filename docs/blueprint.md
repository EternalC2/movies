# **App Name**: CineVerse

## Core Features:

- Trending Content: Display trending movies and series fetched from the TMDB API on the homepage, including posters, titles, scores, and release years.
- Real-time Search: Implement a search functionality that provides real-time search results from the TMDB API as the user types.
- Detailed Content Pages: Create detail pages for each movie and series, displaying backdrops, descriptions, genres, cast information, and TMDB scores.
- Embedded Player: Embed the Vidsrc Player API to play movies and series using the provided endpoints (https://vidsrc-embed.ru/embed/movie/{tmdb_id} and https://vidsrc-embed.ru/embed/tv/{tmdb_id}).
- User Authentication: Implement user authentication using Firebase Auth, allowing users to log in or register with email or Google.
- Favorites Management: Allow logged-in users to save movies or series to their favorites list, stored in Firestore.
- Account Page: Create an account page displaying the user's profile information, favorites, and a logout button.

## Style Guidelines:

- Background color: Dark, desaturated blue-gray (#222730) to create a cinematic feel that allows content to stand out.  Darker colors increase perceived contrast. This fits the 'between Netflix and Apple TV+' part of the prompt. This scheme supports dark and light modes.
- Primary color: Medium cyan (#42cbf5), a vibrant and attention-grabbing hue that still provides affordances and readability on the dark-themed background.
- Accent color: Light electric blue (#7DF9FF), an analogous color to the primary that is used sparingly for highlights, button states and other interactive elements. The goal is to draw focus in a way that harmonizes with the brand.
- Body: 'Inter', a grotesque-style sans-serif, which pairs well with the headline font and renders cleanly at a variety of sizes. Headline: 'Space Grotesk', a sans-serif for titles.
- Use a responsive grid layout for posters, ensuring optimal viewing on mobile, tablet, and desktop devices. The number of grid columns should change automatically to take advantage of the available screen width.
- Employ a set of minimalist, modern icons for navigation and user actions. These icons should maintain visual harmony in both light and dark themes. Consider icons from the Material Design or Font Awesome libraries, adjusted as necessary to fit in.
- Implement subtle hover effects and transitions using framer motion to enhance user interaction, providing feedback when content is focused.