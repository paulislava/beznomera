export interface AddDriverButtonProps {
  carId: number;
  eventData?: Record<string, any>;
  onSuccess?: () => void;
}