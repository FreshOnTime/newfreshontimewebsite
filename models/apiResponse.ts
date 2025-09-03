export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  metadata?: {
    timestamp: Date;
    [key: string]: unknown;
  };
}
