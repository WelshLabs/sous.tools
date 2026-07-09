export interface VisualBuilderProps {
  editedData: string;
  onChange: (newData: string) => void;
  disabled: boolean;
  organizationId: string;
}
