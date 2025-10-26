# Travellers Without Borders Interface

This project contains a multi-page travel portal built with HTML, CSS, and vanilla JavaScript.
It implements the registration, login, dashboard, and purchase flows described in the
Interfaces de Usuario coursework.

## Project structure

- `homepage.html` – public landing page with login form, rotating featured trips carousel,
  and marketing content.
- `registration_form.html` – registration form (Version A) with all required validations.
- `logged.html` – protected dashboard (Version B) that shows the logged-in profile,
  rotating featured trips, latest tips, and logout confirmation modal.
- `buy.html` – purchase form (Version C) that validates payment details.
- `styles/` – shared CSS files for the layout and individual pages.
- `js/` – JavaScript files that handle validation, storage, and interaction logic per page.
- `images/` – static image assets used throughout the UI.

## How it works

1. **Homepage (`homepage.html`)**
   - Visitors can log in with previously registered credentials or follow the link to the
     registration form.
   - The featured trips carousel automatically cycles through offers every two seconds and
     stores the selected pack before opening the purchase page.
   - Successful logins set the active session in `localStorage` and redirect to `logged.html`.

2. **Registration (`registration_form.html`)**
   - Validates every required field (names, email confirmation, date of birth, username,
     password strength, accepted file type, and privacy policy acceptance).
   - Stores the new user in `localStorage` and opens a session automatically after a
     successful registration, redirecting to the dashboard.

3. **Dashboard (`logged.html`)**
   - Requires an active session (otherwise the visitor is sent back to `homepage.html`).
   - Mirrors the homepage carousel so logged-in travellers can keep browsing featured trips.
   - Displays the stored profile name and avatar (if provided) and allows logging out with a
     confirmation modal.
   - Shows the three most recent tips saved in `localStorage` and lets users contribute new
     tips after validating the minimum length.

4. **Purchase (`buy.html`)**
   - Loads the trip data saved by the carousel and validates the payment form (card type,
     number length, expiry date, and CVV) before simulating a purchase with modal feedback.
   - Includes a reset button to clear the form and restore the initial state.

## Running the project

Open `homepage.html` in a modern browser (Chrome or Firefox) to explore the full flow.
Because the site uses `localStorage`, all functionality works without a build step or
additional dependencies.

To reset stored data during development, clear the browser's local storage for the site.
