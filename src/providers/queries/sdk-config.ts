import { ConfigManager, setHiveTxNodes } from '@ecency/sdk';
import Config from 'react-native-config';
import { QueryClient } from '@tanstack/react-query';
import { getServer } from '../../realm/realm';
import { getNodes } from '../ecency/ecency';

/**
 * Fetch DMCA filtering lists from Ecency server
 * Fetches accounts, posts, and tags to filter from DMCA lists
 */
const fetchDmcaLists = async (): Promise<{
  accounts: string[];
  tags: string[];
  posts: string[];
}> => {
  try {
    const [accountsRes, postsRes, tagsRes] = await Promise.all([
      fetch('https://ecency.com/dmca/dmca-accounts.json'),
      fetch('https://ecency.com/dmca/dmca-posts.json'),
      fetch('https://ecency.com/dmca/dmca-tags.json'),
    ]);

    const accounts = accountsRes.ok ? await accountsRes.json() : [];
    const posts = postsRes.ok ? await postsRes.json() : [];
    const tags = tagsRes.ok ? await tagsRes.json() : [];

    return { accounts, tags, posts };
  } catch (error) {
    console.warn('⚠️ Failed to fetch DMCA lists, continuing without filters:', error);
    return { accounts: [], tags: [], posts: [] };
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

  // Sync saved server preference and fetched nodes to SDK
  const savedServer = await getServer();
  const fetchedNodes = await getNodes();
  const hasValidServer = typeof savedServer === 'string' && savedServer.trim() !== '';
  const nodes =
    hasValidServer && !fetchedNodes.includes(savedServer)
      ? [savedServer, ...fetchedNodes]
      : [...fetchedNodes];
  ConfigManager.setHiveNodes(nodes);
  // 20 s matches hive-tx's default and gives broadcast_transaction_synchronous
  // enough headroom; shorter values abort successful broadcasts mid-flight.
  setHiveTxNodes(nodes, 20000);

  // Fetch and configure DMCA filters
  const dmcaLists = await fetchDmcaLists();
  ConfigManager.setDmcaLists(dmcaLists);

  console.log('✅ Ecency SDK configured successfully');
};
