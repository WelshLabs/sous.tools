### #67: convert to drizzle??
**Labels:** enhancement, question, backend, database

should we convert the sql to use drizzle or is that too much at this point?

---

### #66: agent skills
**Labels:** backend

we need to make sure that the .agents folder is up-to-date with skills and other context for our "hands" agents

---

### #65: staging site redirect loop
**Labels:** bug, backend, devops

currently the staging site gets in a never ending redirect loop and we have tried all kinds of ways to diagnose it but nothing has fixed it yet

---

### #64: Storybook
**Labels:** enhancement, design-system, frontent

It would be nice, to have a Storybook setup, to be able to interact with our View components to be able to adjust designs and functionality in isolation

---

### #63: design-system cleanup
**Labels:** documentation, enhancement, design-system, frontent

we need to ensure that our packages/design-system is cleaned up, and properly following the atom/molecule/organism/container design philosophy.  Currently almost all components are just single files instead of folders, and none of them have tests written for them.

One for instance is what should be a folder called Supplier, but instead it is 4 files:
- SupplierHeader.tsx
- SupplierLineItem.tsx
- SupplierOrderGroup.tsx
- SupplierOrderGroup.types.ts

but most all of the components need to be refactored to follow the correct structures and must also have tests and documentation written.

---

### #62: omnibar merge
**Labels:** enhancement, frontend, design-system

we need to merge the new omnibar design from the v0 package

---

### #61: logos
**Labels:** invalid, question



---

### #60: packages/api-types
**Labels:** enhancement, question, backend

now that we have a packages/api-client in place... should packages/api-types still be a separate package or should they be merged??

---

### #59: scaling helpers
**Labels:** enhancement, design-system

currently the recipe scaling utils are located in the design-system package, but this is most certainly domain-recipes logic and does not belong in design-system

---

### #58: waffle menu
**Labels:** bug, frontend

when clickout outside of the menu i would expect it to close, but it only does so if you click on the app bar.  I think there is an invisible click target underneath the waffle menu, but i think its being confined to the appbar instead of covering the whole screen.

---

### #57: login page
**Labels:** enhancement, backend, frontend, design-system

can we add remember me, forgot password, and login with google or github buttons to the login screen?

---

### #56: omnibutton
**Labels:** bug, frontend, design-system

sometimes, especially after its been focused and closed, the omni button appears as a square instead of a circle.

it is also showing up in the center of the screen now when it should actually be a FAB in the bottom right corner

---

### #55: Registration Page
**Labels:** enhancement, backend, frontend, database

we need a page where new tenants can register and create a tenant.

after they login they will get the full tutorial experience #45 

at the end of the tutorial they should be taken to the settings page and displayed a tab that shows their tenant settings.  on this tab will have to be the place to enter billing info into Stripe to setup their recurring monthly fees.  They will also need the ability to change the tiered plan they are, which of course would limit the functionality of the app.

each page in the app should utilize whichever nextjs special file that makes sense such as unauthorized.ts to be able to let a user whos tenant is not subscribed to the feature they are trying to view that they need to upgrade to have this functionality.

---

### #47: Square Integration
**Labels:** enhancement, backend, devops, database

We need to have Square fully wired up.

- development and staging should connect to the square sandbox, production should connect to square production
- we need to seed sample data into the square sandbox, it would be nice if we queried the production square data and seeded the sandbox with that so we are working with a structure exactly the same as our production will
- we need to ensure that it stays driver based and agents do not get lazy and hardcode implementations instead of placing them in the drivers
- we need all sales related data
- we need the entire catalog data set
- we need access to orders for the kds
- we need to be able to make sales/purchases for the POS
- we need the whole thing to be able to be 2-way synced into our shadow database, because both systems should be able to be used at the exact same time indefinitely, so they both need to have the same info for shared data, and our system will include additional data not present in square to associate to square data

---

### #45: Tutorial system
**Labels:** enhancement, frontend, design-system

We need to add a tutorial system to the app, hovers and popovers and whatnot instructing a user how to use the app that once shown will no longer be shown to the user, industry standard onloading tutorials but make them beautiful and animated and minimalistic.

---

### #44: Recipes Page
**Labels:** enhancement, backend, frontend, design-system, database

- can we have a tutorial step that instructs the user that they can use the omnibar to add recipes, and if there are no recipes at all the default page should be an informative message letting a user know the different ways they can populate recipes into the system
- we need a better way to list the recipes
- we need to be able to pin recipes
- we need to be able to mark recipes as favorites
- we need to be able to search recipes
- we need to be able to filter recipes by tags, categories, dietary restrictions, type of cuisine, etc

---

### #43: Tech Debt: Upgrade setup-portal to Next.js 16
**Labels:** enhancement, frontent

The setup-portal application is currently running on Next.js 14. We need to upgrade it to Next.js 16 to align with the monorepo standards and remove the experimental instrumentationHook workaround.

---

### #42: Logo / Branding
**Labels:** enhancement, design-system

The logo, the lettermark, the icons, the overall branding needs some serious help.

---

### #41: light mode colors
**Labels:** bug, frontend, design-system

if you look at the /home page the logo in the center of the screen is using the correct blue, however the rest of the page is using more of a greener blue, this needs to be unified ubiquitously

---

### #40: KDS Functionality
**Labels:** bug, enhancement, backend, frontent

- link to live orders
- show completed orders from live data
- functional all day counts
- functional completion of individual items or whole tickets

---

### #39: POS Functionality
**Labels:** enhancement, backend, design-system, frontent, database

- fully integrate with live pos data
- fully active cart
- actually pull in real categories
- design beautiful menu to show all items
- setup beautiful and simple modifier menus

---

### #22: omnibar uploads
**Labels:** enhancement, design-system, frontent

After clicking the attachment button, it should fly out somehow into a few icons: file upload; camera; Google drive.  Also there should be the ability to copy/paste a file in the input.  This should be really visually appealing with wonderful UI/UX.

Can we have the ability to be on a social page or webpage etc and click the share button and have the pwa be an option to share it to? And take you to /home and right into the omnibar with that context?

---

### #12: Square Integration
**Labels:** bug, enhancement, backend, frontent

- trying to connect to square currently just says "Organization not loaded yet. Please refresh the page." when you click the button.
- need to load in all sales data from square and have a screen in the UI to show sales
- need to load all items in from square and have an item catalog editor in the UI as its own page to e able to view the entire catalog: items/modifiers/groups/categories/discounts/units/etc
- need to be able to fetch orders from square and have an orders page, as well as be able to show them in the KDS
- need a transactions page that fetches data from square

I know we are referring to Square in particular here but it should be driver based so we can implement drivers for Toast/Lightspeed/etc


---

