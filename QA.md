# 7/1/22 QA Findings

## Mobile

- the bottom appbar is overflowing off the screen, you cannot even see the "more" button to be able to open the menu so you cant really navigate the app
- there is no app icon for the PWA
- order manager is completely overlapping itself and unusasble

## Tablet

- no app icon

## Desktop / General Notes

- it may be nice to have breadcrumb navigation throughout the site
- the logo on the marketing page is showing the terminal variant when we shoul always be showing the primary (only) variant
- the colors on the marketing page should match our newly updated designs
- the login button on the login page says "access control" when it should say login or sign in
- we should have a login with google button on the login page
- i dont really like the "reload analytics button" on the dashboard, it should just update on its own if the page is open
- light mode styling needs some work, the cards are a bland graysih color
- the mini variant on the sidebar that just shows the icons not the labels that is open by default on a tablet
- the recipes page content does not adjust to the light theme
- some of the signage editor adjusts the the light theme but not all of it
- devices page content is not adjusting to light theme
- admin users page redirects to /admin/users and gets a 404
- in the users dropdown in the appbar if there is no profile photo it shows a user icon, can we make an avatar component, have it show initials if no photo and have a user be able to upload a photo or show their google photo if logged in with google
- the favicon in the browser tab is still showing as black when i requested it to have a transparent background and our primary blue lines
- we should get the new functionality added to the orders page, and the add a vendor should use intercepting and parallel routes to have a modal so that the modal can be shown on this page as well as on the vendors page
- vendors schema will need to be updated to add fields for the new data we are starting to collect via invoice ingestion

I have not really tried much actual functionality throughout the site yet, this was mostly a visual QA session.

A note on design... its still not there all the way i want it, i am just noting this as a fun fact... because i am really curious as to how it will look after we finish migrating the design from what we did on the orders page... it may be worth revisiting the v2 site for other parts of the app as well, one place in particular is the layout.
