import React, { useEffect, useState } from 'react';
import {
  actionHref,
  ApiClient,
  OriginalList,
  type ActionProps,
} from 'adminjs';
import { Box, Button, H2, Text } from '@adminjs/design-system';
import type { UserStatistics } from '@shared/contracts/admin.contract.js';

const adminApi = new ApiClient();

const UserAccountsList = (props: ActionProps) => {
  const { resource } = props;
  const [statistics, setStatistics] = useState<UserStatistics>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const emailUsersAction = resource.resourceActions.find(
    ({ name }) => name === 'emailUsers',
  );
  const emailUsersHref = emailUsersAction
    ? actionHref(emailUsersAction, { resourceId: resource.id })
    : null;

  useEffect(() => {
    let cancelled = false;

    const loadStatistics = async () => {
      try {
        const response = await adminApi.resourceAction({
          resourceId: resource.id,
          actionName: 'userStatistics',
        });
        const result = response.data as {
          statistics?: UserStatistics;
          error?: string;
        };
        if (result.error) {
          throw new Error(result.error);
        }
        if (
          !result.statistics ||
          !Number.isInteger(result.statistics.activeUsers) ||
          !Number.isInteger(result.statistics.usersCreatedLast90Days)
        ) {
          throw new Error('Invalid user account statistics response.');
        }
        if (!cancelled) {
          setStatistics(result.statistics);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load user account statistics. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadStatistics();
    return () => {
      cancelled = true;
    };
  }, [resource.id]);

  return (
    <>
      <Box variant="grey" mb="xl">
        <Box variant="white">
          <H2>User Account Statistics</H2>
          {isLoading ? (
            <Text>Loading user account statistics...</Text>
          ) : error ? (
            <Text color="error">{error}</Text>
          ) : statistics ? (
            <>
              <Text>Active accounts: {statistics.activeUsers}</Text>
              <Text>
                Accounts created in the last 90 days:{' '}
                {statistics.usersCreatedLast90Days}
              </Text>
            </>
          ) : (
            <Text color="error">User account statistics are unavailable.</Text>
          )}
          {emailUsersHref ? (
            <Button onClick={() => window.location.assign(emailUsersHref)}>
              Email Users
            </Button>
          ) : (
            <Text color="error">The Email Users page is unavailable.</Text>
          )}
        </Box>
      </Box>
      <OriginalList {...props} />
    </>
  );
};

export default UserAccountsList;
