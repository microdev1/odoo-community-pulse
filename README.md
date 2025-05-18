# Community Pulse

A location-aware platform designed to facilitate interaction, visibility, and participation within defined geographic communities.

## Features

- Users can post and browse events. Supported category Garage Sales, Sports, Matches (local cricket, football, tennis, etc.), Community Classes (yoga sessions, art classes, educational workshops), Volunteer Opportunities (clean-up drives donation camps), Exhibitions, Small Festivals or Celebrations.
- Also, the user can edit and delete his/her event.
- Users can mark their interest in attending an event without needing to fill out lengthy forms (only take name, email, phone, and number of people coming with you).
- Notification Connectors (through either one of Email, SMS, or WhatsApp):
  1. Reminder 1 day before the event.
  2. Live updates if the event changes (e.g., location change or cancellation).
- Mobile freindly

## Admin Role

- View, approve, or reject submitted events.
- Flag inappropriate content and remove if needed.
- View event history by user.
- Assign "Verified Organizer" status.
- Ban users if needed.

## Structure

- header shows `Pulse`, Searchbar and Login
- on authentication, header shows `Pulse`, Searchbar, regitered event, my events, avatar and logout
- adapt layout to make site mobile compatible as well

### Home Page

- Cards for events with image as full background
- Translucent text overlay on card image like apple app store
- Show title, one line description, date, time, location, and category

### Event Page

- Split layout between content and sidebar
- Content: background image, title, description
- Right sidebar on wide screen and between title and description on mobile
- Sidebar: rgister button, event date and time duration slot, location address, organizer details name, phone and mail, category
- if not logged in register should redirect to auth page which should redirect back to event page
- if logged in register should show a form with name, email, phone filled in from user profile and number of people coming with you
- if event created bu user, add option to edit or delete event

### Event Creation Page

- displays a from with image, title, description, date, time, location, category, registration deadline etc.

## Demo

Check out our demo video at Google Drive: [Demo Video](https://drive.google.com/drive/folders/1TCzT8iX0o_x8m1gQsi8P0v3NzFTTYZlz?usp=sharing)
