# Garden Editor Sections

This folder contains the different tabbed sections for the Garden Editor interface.

## Folder Structure

- **BasicInfoSection**: Garden names, regions, and basic identifiers
- **EnvironmentSection**: Sunlight, soil characteristics, and growing conditions
- **DesignSection**: Garden themes, location types, and design features
- **PlantsSection**: Plant types, forms, wildlife interactions, and resistance
- **AestheticsSection**: Flower colors, leaf characteristics, and visual elements
- **PreferencesSection**: Maintenance levels and user preferences

## Tab Organization

The tabs are organized in a logical flow that makes sense for users setting up their garden:

1. **Basic Info** - Starting point for garden setup (name, location, etc.)
2. **Environment** - Physical growing conditions
3. **Design** - Style and theme of the garden
4. **Plants** - Specific plant characteristics
5. **Aesthetics** - Visual appearance elements
6. **Preferences** - User's personal preferences

This structure follows the definition in the `types/gardenTabs.ts` file, which maps database fields to specific tabs for better organization.

## How to Add New Sections

To add a new section:

1. Create a new component file in this directory
2. Add the section to the GARDEN_TABS array in types/gardenTabs.ts
3. Update the FIELD_TO_TAB_MAPPING object in types/gardenTabs.ts to map fields to your new tab
4. Add the appropriate rendering logic in the GardenEditorTabs component
