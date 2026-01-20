import { ConfigManager } from '@ecency/sdk';
import Config from 'react-native-config';
import { QueryClient } from '@tanstack/react-query';

/**
 * Initializes the Ecency SDK configuration
 * Must be called after QueryClient is created
 */
export const initSdkConfig = (queryClient: QueryClient) => {
  // Set the query client for SDK to use
  ConfigManager.setQueryClient(queryClient);

  // Configure Ecency private API host
  ConfigManager.setPrivateApiHost(Config.ECENCY_BACKEND_API);

  // Configure image host
  ConfigManager.setImageHost(Config.NEW_IMAGE_API || 'https://images.ecency.com');

  // Initialize DMCA filters
  ConfigManager.initDmca();

  console.log('✅ Ecency SDK configured successfully');
};
