import React, { useEffect, useState } from 'react';
import {
  actionHref,
  ApiClient,
  OriginalBreadcrumbs,
  OriginalList,
  type ActionProps,
  useFilterDrawer,
  useTranslation,
} from 'adminjs';
import { Box, Button, ButtonGroup, H2, Text } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import type { UserStatistics } from '@shared/contracts/admin.contract.js';

const adminApi = new ApiClient();
const UserBreadcrumbs = styled(Box)`
  [data-css='User-list-breadcrumbs'] {
    margin-bottom: 10px;
  }
`;
const UserAccountsPanel = styled(Box)`
  [data-css='User-list-table-wrapper'] {
    background: transparent;
    border-radius: 0;
    padding: 0;
  }
`;

const UserAccountsList = (props: ActionProps) => {
  const { action, resource } = props;
  const { toggleFilter, filtersCount } = useFilterDrawer();
  const { translateAction, translateButton } = useTranslation();
  const [statistics, setStatistics] = useState<UserStatistics>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const newAction = resource.resourceActions.find(({ name }) => name === 'new');
  const newActionHref = newAction
    ? actionHref(newAction, { resourceId: resource.id })
    : null;
  const emailUsersAction = resource.resourceActions.find(
    ({ name }) => name === 'emailUsers',
  );
  const emailUsersHref = emailUsersAction
    ? actionHref(emailUsersAction, { resourceId: resource.id })
    : null;
  const listButtons = [];
  if (newAction && newActionHref) {
    listButtons.push({
      label: translateAction(newAction.label, resource.id),
      href: newActionHref,
      icon: newAction.icon,
      variant: newAction.variant,
    });
  }
  if (action.showFilter) {
    listButtons.push({
      label: translateButton(
        filtersCount > 0 ? 'filterActive' : 'filter',
        resource.id,
        { count: filtersCount },
      ),
      onClick: toggleFilter,
      icon: 'Filter',
      'data-css': `${resource.id}-filter-button`,
    });
  }

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
          !Number.isInteger(result.statistics.usersCreatedLast90Days) ||
          !Number.isInteger(result.statistics.savedCustomProjects) ||
          !Number.isInteger(result.statistics.customProjectsUpdatedLast90Days)
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
      <UserBreadcrumbs flex flexDirection="row" px={['default', 0]}>
        <OriginalBreadcrumbs resource={resource} actionName={action.name} />
      </UserBreadcrumbs>
      <UserAccountsPanel variant="container" width="100%" mb="xl">
        <Box
          flex
          flexWrap="wrap"
          alignItems="center"
          justifyContent="space-between"
          mb="xl"
        >
          <Box>
            <H2>User Account Statistics</H2>
            <Text color="grey60">A quick overview of account activity</Text>
          </Box>
          {emailUsersHref ? (
            <Button
              variant="outlined"
              style={{
                color: 'rgb(33, 107, 165)',
                borderColor: 'rgb(33, 107, 165)',
              }}
              onClick={() => window.location.assign(emailUsersHref)}
            >
              Email Users
            </Button>
          ) : (
            <Text color="error">The Email Users page is unavailable.</Text>
          )}
        </Box>
        {isLoading ? (
          <Text>Loading user account statistics...</Text>
        ) : error ? (
          <Text color="error">{error}</Text>
        ) : statistics ? (
          <Box
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 15rem), 1fr))',
            }}
          >
            <Box variant="card" borderTop="4px solid rgb(33, 107, 165)">
              <Text
                fontSize="lg"
                color="rgb(33, 107, 165)"
                fontWeight="bold"
                mb="sm"
                textAlign="center"
              >
                Active accounts
              </Text>
              <Text fontSize="h2" fontWeight="bold" textAlign="center">
                {statistics.activeUsers}
              </Text>
            </Box>
            <Box variant="card" borderTop="4px solid rgb(33, 107, 165)">
              <Text
                fontSize="lg"
                color="rgb(33, 107, 165)"
                fontWeight="bold"
                mb="sm"
                textAlign="center"
              >
                Created in the last 90 days
              </Text>
              <Text fontSize="h2" fontWeight="bold" textAlign="center">
                {statistics.usersCreatedLast90Days}
              </Text>
            </Box>
            <Box variant="card" borderTop="4px solid rgb(33, 107, 165)">
              <Text
                fontSize="lg"
                color="rgb(33, 107, 165)"
                fontWeight="bold"
                mb="sm"
                textAlign="center"
              >
                Saved projects
              </Text>
              <Text fontSize="h2" fontWeight="bold" textAlign="center">
                {statistics.savedCustomProjects}
              </Text>
            </Box>
            <Box variant="card" borderTop="4px solid rgb(33, 107, 165)">
              <Text
                fontSize="lg"
                color="rgb(33, 107, 165)"
                fontWeight="bold"
                mb="sm"
                textAlign="center"
              >
                Projects Created or edited in the last 90 days
              </Text>
              <Text fontSize="h2" fontWeight="bold" textAlign="center">
                {statistics.customProjectsUpdatedLast90Days}
              </Text>
            </Box>
          </Box>
        ) : (
          <Text color="error">User account statistics are unavailable.</Text>
        )}
      </UserAccountsPanel>
      <UserAccountsPanel variant="container" width="100%" mb="xl">
        <Box
          flex
          flexDirection={['column', 'row']}
          alignItems={['flex-start', 'center']}
          justifyContent="space-between"
          mb="default"
        >
          <Box flex alignItems="center" mb={['default', 0]}>
            <H2 mb="0">Users</H2>
          </Box>
          <ButtonGroup size="sm" rounded buttons={listButtons} />
        </Box>
        <OriginalList {...props} />
      </UserAccountsPanel>
    </>
  );
};

export default UserAccountsList;
