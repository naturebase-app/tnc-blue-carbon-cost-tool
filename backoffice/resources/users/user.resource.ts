import { ResourceWithOptions } from 'adminjs';
import { User } from '@shared/entities/users/user.entity.js';
import { createUserAction } from './user.actions.js';
import { GLOBAL_COMMON_PROPERTIES } from '../common/common.resources.js';
import { Components } from 'backoffice/components/index.js';
import { API_URL } from 'backoffice/config/api-url.js';
import { UserEmailCategoriesSchema } from '@shared/contracts/admin.contract.js';
import type { UserStatistics } from '@shared/contracts/admin.contract.js';

export const UserResource: ResourceWithOptions = {
  resource: User,
  options: {
    translations: {
      en: {
        labels: {
          User: 'User Accounts',
        },
      },
    },
    navigation: {
      name: 'User Management',
      icon: 'User',
    },
    sort: {
      sortBy: 'name',
      direction: 'asc',
    },
    properties: {
      ...GLOBAL_COMMON_PROPERTIES,
      password: { isVisible: false },
      isActive: { isVisible: false },
      email: { isRequired: true },
      role: { isRequired: true },
      partnerName: { isRequired: true },
    },
    actions: {
      list: {
        component: Components.UserAccountsList,
        hideActionHeader: true,
        showResourceActions: false,
      },
      userStatistics: {
        actionType: 'resource',
        isVisible: false,
        handler: async (_request, response, { currentAdmin }) => {
          if (!currentAdmin?.accessToken) {
            return { error: 'Admin authentication is required.' };
          }

          const apiResponse = await fetch(`${API_URL}/admin/users/statistics`, {
            headers: {
              Cookie: response.req.headers.cookie,
            },
          });
          if (!apiResponse.ok) {
            return { error: 'Unable to load user account statistics.' };
          }

          const result = (await apiResponse.json()) as { data: UserStatistics };
          return { statistics: result.data };
        },
      },
      emailUsers: {
        actionType: 'resource',
        icon: 'Mail',
        component: Components.EmailUsersAction,
        showResourceActions: false,
        handler: async (request, response, { currentAdmin }) => {
          if (!currentAdmin?.accessToken) {
            return { error: 'Admin authentication is required.' };
          }

          try {
            const requestedCategories = request.payload?.categories;
            let categoriesQuery = '';
            if (requestedCategories !== undefined) {
              const parsedCategories =
                UserEmailCategoriesSchema.safeParse(requestedCategories);
              if (!parsedCategories.success) {
                return { error: 'Invalid recipient category selection.' };
              }
              categoriesQuery = `?categories=${encodeURIComponent(
                parsedCategories.data.join(','),
              )}`;
            }

            const apiResponse = await fetch(
              `${API_URL}/admin/users/emails${categoriesQuery}`,
              {
                headers: {
                  Cookie: response.req.headers.cookie,
                },
              },
            );
            if (!apiResponse.ok) {
              return { error: 'Unable to load user email addresses.' };
            }

            const result = (await apiResponse.json()) as { data: string[] };
            return { emails: result.data };
          } catch (error) {
            console.error('Error loading user email addresses.', error);
            return { error: 'Unable to load user email addresses.' };
          }
        },
      },
      new: {
        actionType: 'resource',
        handler: createUserAction,
      },
    },
  },
};
