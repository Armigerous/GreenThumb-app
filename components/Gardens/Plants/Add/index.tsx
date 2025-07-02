/**
 * This file exports all the components from the Add Plant flow
 * and provides a convenient API for importing them
 */

// Export individual components
export { default as Header } from "./Header";
export { default as ProgressIndicator } from "../../../UI/ProgressIndicator";
export { default as LoadingState } from "./LoadingState";
export { default as ErrorMessage } from "./ErrorMessage";
// PlantStatusSelector removed - no longer expose plant status to users
export { default as SubmitButton } from "../../../UI/SubmitButton";
export { default as GardenSelectionStep } from "./GardenSelectionStep";
export { default as PlantDetailsStep } from "./PlantDetailsStep";
export { default as ConfirmationStep } from "./ConfirmationStep";
export { default as ImagePicker } from "./ImagePicker";
// Export types
// StatusOption type removed with PlantStatusSelector component
