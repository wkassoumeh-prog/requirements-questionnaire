export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "color_palette"
  | "style_cards"
  | "inspiration_gallery"
  | "file"
  | "repeatable";

export interface FormOption {
  id: string;
  label: string;
  description?: string;
  example?: string;
}

export type ConditionOperator = "equals" | "includes" | "not_empty";

export interface FieldCondition {
  fieldId: string;
  operator: ConditionOperator;
  value?: string | string[];
}

export interface ColorPalettePreset {
  id: string;
  name: string;
  colors: string[];
}

export interface InspirationExample {
  id: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  helpText?: string;
  placeholder?: string;
  example?: string;
  required?: boolean;
  options?: FormOption[];
  allowOther?: boolean;
  allowAdditionalDetails?: boolean;
  otherLabel?: string;
  conditional?: FieldCondition;
  repeatableFields?: FormField[];
  repeatableAddLabel?: string;
  config?: {
    palettes?: ColorPalettePreset[];
    inspiration?: InspirationExample[];
    minSelections?: number;
    maxSelections?: number;
    primaryFieldId?: string;
  };
  hidden?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
  hidden?: boolean;
}

export type QuestionnaireTemplateId = "concise" | "comprehensive";

export interface FormSchema {
  version: number;
  /** Which starter template this questionnaire was based on (editable copy). */
  baseTemplateId?: QuestionnaireTemplateId;
  sections: FormSection[];
}

export type FormAnswers = Record<string, unknown>;

export interface SiteSettings {
  agencyName: string;
  logoUrl?: string;
  accentColor: string;
  welcomeMessage: string;
  formIntroduction: string;
  confirmationMessage: string;
  footerText: string;
  contactEmail: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  agencyName: "Studio Brief",
  accentColor: "#4F46E5",
  welcomeMessage: "Website requirements questionnaire",
  formIntroduction:
    "Answer at your own pace. Your responses help us understand your business and build a website that fits your goals. You can save a draft and return anytime using your private link.",
  confirmationMessage:
    "Thank you — your requirements have been submitted. We will review everything and follow up with next steps.",
  footerText: "Your information is kept confidential and used only for your website project.",
  contactEmail: "hello@example.com",
};
