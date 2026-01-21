import { ConfigManager } from '@ecency/sdk';
import Config from 'react-native-config';
import { QueryClient } from '@tanstack/react-query';

/**
 * Fetch DMCA filtering lists from Ecency server
 * Fetches accounts, posts, and tags to filter from DMCA lists
 */
const fetchDmcaLists = async (): Promise<{
  accounts: string[];
  tags: string[];
  patterns: string[];
}> => {
  try {
    const [accountsRes, postsRes, tagsRes] = await Promise.all([
      fetch('https://ecency.com/dmca/dmca-accounts.json'),
      fetch('https://ecency.com/dmca/dmca-posts.json'),
      fetch('https://ecency.com/dmca/dmca-tags.json'),
    ]);

    const accounts = accountsRes.ok ? await accountsRes.json() : [];
    const patterns = postsRes.ok ? await postsRes.json() : [];
    const tags = tagsRes.ok ? await tagsRes.json() : [];

    return { accounts, tags, patterns };
  } catch (error) {
    console.warn('⚠️ Failed to fetch DMCA lists, continuing without filters:', error);
    return { accounts: [], tags: [], patterns: [] };
  }
};

/**
 * Initializes the Ecency SDK configuration
 * Must be called after QueryClient is created
 */
export const initSdkConfig = async (queryClient: QueryClient) => {
  // Set the query client for SDK to use
  ConfigManager.setQueryClient(queryClient);

  // Configure Ecency private API host
  ConfigManager.setPrivateApiHost(Config.ECENCY_BACKEND_API);

  // Configure image host
  ConfigManager.setImageHost(Config.NEW_IMAGE_API || 'https://images.ecency.com');

  // Fetch and configure DMCA filters
  const dmcaLists = await fetchDmcaLists();
  ConfigManager.setDmcaLists(dmcaLists.accounts, dmcaLists.tags, dmcaLists.patterns);

  console.log('✅ Ecency SDK configured successfully');
};
