# Trashimon Tasks

## Core Functionality
- [x] Persist trash markers across browser sessions.
- [ ] Implement stank zone calculation based on trash markers.
- [ ] Persist stank zones across browser sessions.
- [ ] Display stank zones on the map.

## Potential Enhancements
- [ ] User accounts/authentication.
- [ ] Backend database for storing data.
- [ ] Allow users to "clean up" trash.
- [ ] Leaderboards/gamification.

## Stank Zone Feature Implementation

- [x] Implement `fetchStankZones` function in trashStore
- [x] Implement `deleteStankZone` function in trashStore
- [x] Update `initializeStore` to load stank zones on startup
- [x] Test stank zone creation functionality
- [ ] Test stank zone deletion functionality
- [ ] Test stank zone notes update functionality
- [x] Add visual feedback when adding stank zones

## Bug Fixes

- [x] Fix stank zones not being saved by implementing proper data fetching
- [x] Ensure stank zone markers appear on the map after adding them
- [ ] Verify user authentication flow for stank zone operations

## Future Enhancements

- [ ] Add ability to filter stank zones by date or user
- [ ] Implement clustering for stank zones when zoomed out
- [ ] Add statistics for stank zones (count, most active areas)
- [ ] Improve mobile responsiveness of stank zone popups
- [ ] Add notifications for nearby stank zones

## Code Maintenance

- [ ] Add more comprehensive error handling for Supabase operations
- [ ] Consider refactoring trashStore if it exceeds 500 lines
- [ ] Add unit tests for stank zone operations 