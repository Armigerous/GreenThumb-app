// Main garden components
export { default as GardenCard } from './GardenCard';
export { default as GardenConditions } from './GardenConditions';
export { default as GardenEditorTabs } from './GardenEditorTabs';
export { default as GardenConditionsEditor } from './GardenConditionsEditor';

// Editor sections
export * from './GardenEditorSections';

// New Garden Form Steps
export * from './NewGardenFormSteps';

// Plant components 
export { default as EditPlantModal } from './Plants/EditPlantModal';
export { default as AddCareLogModal } from './Plants/AddCareLogModal';
export { default as PlantCareHistory } from './Plants/PlantCareHistory';

// Add plant components
export { 
  ErrorMessage, 
  GardenSelectionStep, 
  PlantDetailsStep,
  ConfirmationStep,
  Header,
  LoadingState,
  ImagePicker,
  PlantStatusSelector
} from './Plants/Add';

// Text components for consistent styling
export { TitleText, SubtitleText, BodyText, Text } from '../UI/Text'; 