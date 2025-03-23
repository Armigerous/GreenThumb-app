/**
 * This file exports all the components from the Add Plant flow
 * and provides a convenient API for importing them
 */

// Export individual components
export { default as Header } from "./Header";
export { default as ProgressIndicator } from "./ProgressIndicator";
export { default as LoadingState } from "./LoadingState";
export { default as ErrorMessage } from "./ErrorMessage";
export { default as PlantImageSelector } from "./PlantImageSelector";
export { default as PlantStatusSelector } from "./PlantStatusSelector";
export { default as SubmitButton } from "./SubmitButton";
export { default as GardenSelectionStep } from "./GardenSelectionStep";
export { default as PlantDetailsStep } from "./PlantDetailsStep";
export { default as ConfirmationStep } from "./ConfirmationStep";

// Export types
export type { StatusOption } from "./PlantStatusSelector";
