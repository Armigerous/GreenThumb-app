import { useState, useCallback, useEffect } from 'react';
import { 
  validateFieldOnSubmit, 
  validateFieldRealTime, 
  ValidationResult 
} from '@/lib/validation';

type FieldType = 'email' | 'phone' | 'password' | 'verification' | 'name';

interface FieldConfig {
  type: FieldType;
  isRequired?: boolean;
  isSignUp?: boolean;
}

interface FieldState {
  value: string;
  error: string | null;
  isValid: boolean;
  isTouched: boolean;
  isValidating: boolean;
}

interface FormValidationHook {
  fields: Record<string, FieldState>;
  updateField: (fieldName: string, value: string) => void;
  validateField: (fieldName: string) => ValidationResult;
  validateAllFields: () => boolean;
  clearErrors: () => void;
  clearField: (fieldName: string) => void;
  setFieldError: (fieldName: string, error: string) => void;
  isFormValid: boolean;
  hasErrors: boolean;
  touchedFields: string[];
}

export function useFormValidation(
  fieldConfigs: Record<string, FieldConfig>
): FormValidationHook {
  const [fields, setFields] = useState<Record<string, FieldState>>(() => {
    const initialFields: Record<string, FieldState> = {};
    
    Object.keys(fieldConfigs).forEach(fieldName => {
      initialFields[fieldName] = {
        value: '',
        error: null,
        isValid: false,
        isTouched: false,
        isValidating: false,
      };
    });
    
    return initialFields;
  });

  // Update field value and trigger real-time validation
  const updateField = useCallback((fieldName: string, value: string) => {
    const config = fieldConfigs[fieldName];
    if (!config) return;

    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        isTouched: true,
        isValidating: true,
      }
    }));

    // Debounced validation for better UX
    const timeoutId = setTimeout(() => {
      const validation = validateFieldRealTime(
        config.type, 
        value, 
        { isSignUp: config.isSignUp }
      );

      setFields(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          error: validation.isValid ? null : validation.error || null,
          isValid: validation.isValid,
          isValidating: false,
        }
      }));
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [fieldConfigs]);

  // Validate a specific field (for submit validation)
  const validateField = useCallback((fieldName: string): ValidationResult => {
    const config = fieldConfigs[fieldName];
    const field = fields[fieldName];
    
    if (!config || !field) {
      return { isValid: false, error: 'Field not found' };
    }

    const validation = validateFieldOnSubmit(
      config.type,
      field.value,
      { 
        isSignUp: config.isSignUp,
        isRequired: config.isRequired 
      }
    );

    // Update field state with validation result
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error: validation.error || null,
        isValid: validation.isValid,
        isTouched: true,
      }
    }));

    return validation;
  }, [fieldConfigs, fields]);

  // Validate all fields (typically called on form submit)
  const validateAllFields = useCallback((): boolean => {
    let isFormValid = true;
    const validationResults: Record<string, ValidationResult> = {};

    // Validate each field
    Object.keys(fieldConfigs).forEach(fieldName => {
      const result = validateField(fieldName);
      validationResults[fieldName] = result;
      if (!result.isValid) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }, [fieldConfigs, validateField]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setFields(prev => {
      const clearedFields = { ...prev };
      Object.keys(clearedFields).forEach(fieldName => {
        clearedFields[fieldName] = {
          ...clearedFields[fieldName],
          error: null,
        };
      });
      return clearedFields;
    });
  }, []);

  // Clear a specific field
  const clearField = useCallback((fieldName: string) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        value: '',
        error: null,
        isValid: false,
        isTouched: false,
        isValidating: false,
      }
    }));
  }, []);

  // Set a specific field error (for server-side validation errors)
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error,
        isValid: false,
      }
    }));
  }, []);

  // Computed properties
  const isFormValid = Object.values(fields).every(field => 
    field.isValid || (!field.isTouched && !fieldConfigs[Object.keys(fields).find(key => fields[key] === field) || '']?.isRequired)
  );

  const hasErrors = Object.values(fields).some(field => field.error !== null);

  const touchedFields = Object.keys(fields).filter(fieldName => fields[fieldName].isTouched);

  return {
    fields,
    updateField,
    validateField,
    validateAllFields,
    clearErrors,
    clearField,
    setFieldError,
    isFormValid,
    hasErrors,
    touchedFields,
  };
}

// Helper hook for common auth form patterns
export function useAuthFormValidation(authMode: 'signin' | 'signup' | 'oauth_completion') {
  const fieldConfigs: Record<string, FieldConfig> = {
    email: { 
      type: 'email', 
      isRequired: true 
    },
    phone: { 
      type: 'phone', 
      isRequired: authMode === 'signup' || authMode === 'oauth_completion',
    },
    password: { 
      type: 'password', 
      isRequired: true, 
      isSignUp: authMode === 'signup' 
    },
    verification: { 
      type: 'verification', 
      isRequired: true 
    },
  };

  return useFormValidation(fieldConfigs);
}

// Helper to get field value
export function useFieldValue(
  formValidation: FormValidationHook, 
  fieldName: string
): [string, (value: string) => void, string | null] {
  const field = formValidation.fields[fieldName];
  
  return [
    field?.value || '',
    (value: string) => formValidation.updateField(fieldName, value),
    field?.error || null,
  ];
} 