import React, { useMemo } from 'react';
import { useJoinedChannelsQuery } from '@ecency/ns-query';

export const ChatChannelsList = React.memo(() => {
  const { data: joinedChannels } = useJoinedChannelsQuery();

  const data = useMemo(
    () => ({
      data: [...(joinedChannels ?? [])],
    }),
    [joinedChannels],
  );

  console.log({ data });

  return <></>;
});
