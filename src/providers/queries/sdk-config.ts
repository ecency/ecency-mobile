import { ConfigManager, hiveTxConfig } from '@ecency/sdk';
import Config from 'react-native-config';
import { QueryClient } from '@tanstack/react-query';
import { getServer } from '../../storage/storage';
import { getNodes } from '../ecency/ecency';
import { isBlockedServer, withoutBlockedServers } from '../../constants/options/api';

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
  ConfigManager.setPrivateApiHost(Config.ECENCY_BACKEND_API!);

  // Configure image host
  ConfigManager.setImageHost(Config.NEW_IMAGE_API || 'https://i.ecency.com');

  // Applied before the first await below. Everything after this point depends on
  // the network, and this function used to leave the Hive read timeout at the SDK
  // default until getNodes() came back, so on exactly the networks the timeout
  // exists for it was never installed.
  // 10s aligns with checkClient() in providers/hive/hive.ts. With async
  // broadcast (broadcast_transaction) the call only awaits mempool accept,
  // so 10s is generous headroom while still failing fast on dead nodes.
  hiveTxConfig.timeout = 10000;

  // Sync saved server preference and fetched nodes to SDK
  const savedServer = await getServer();

  const hasValidServer =
    typeof savedServer === 'string' && savedServer.trim() !== '' && !isBlockedServer(savedServer);

  // Install the stored preference immediately, before the fetched list is
  // awaited: a Hive read issued while getNodes() is still outstanding should go
  // to the node the user chose rather than to the SDK's built-in default.
  if (hasValidServer) {
    ConfigManager.setHiveNodes([savedServer]);
  }

  // Denied nodes are dropped from BOTH sides. The saved preference is prepended
  // when it is not already in the fetched list, so filtering only the fetched
  // list would promote a stored bad node to the front of the pool.
  const fetchedNodes = withoutBlockedServers(await getNodes());
  const nodes =
    hasValidServer && !fetchedNodes.includes(savedServer)
      ? [savedServer, ...fetchedNodes]
      : [...fetchedNodes];
  ConfigManager.setHiveNodes(nodes);

  // Fetch and configure DMCA filters
  const dmcaLists = await fetchDmcaLists();
  ConfigManager.setDmcaLists(dmcaLists);

  console.log('✅ Ecency SDK configured successfully');
};
