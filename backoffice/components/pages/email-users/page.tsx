import React, { useEffect, useState } from 'react';
import { ApiClient, type ActionProps } from 'adminjs';
import { Box, Button, CheckBox, H2, Label, Text } from '@adminjs/design-system';
import type { UserEmailCategory } from '@shared/contracts/admin.contract.js';

const adminApi = new ApiClient();

const RECIPIENT_CATEGORIES: {
  value: UserEmailCategory;
  label: string;
}[] = [
  { value: 'all', label: 'All users (including disabled accounts)' },
  { value: 'active', label: 'Active users' },
  { value: 'saved-projects', label: 'Users with saved custom projects' },
];

const EmailUsers = ({ resource, action }: ActionProps) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedCategories, setSelectedCategories] = useState<
    UserEmailCategory[]
  >(['active']);
  const [copyFeedback, setCopyFeedback] = useState<{
    message: string;
    isError: boolean;
  }>();

  useEffect(() => {
    let cancelled = false;

    const loadEmails = async () => {
      setIsLoading(true);
      setError(undefined);
      setCopyFeedback(undefined);

      try {
        const response = await adminApi.resourceAction({
          resourceId: resource.id,
          actionName: action.name,
          data: { categories: selectedCategories },
        });
        const result = response.data as {
          emails?: unknown;
          error?: string;
        };
        if (result.error) {
          throw new Error(result.error);
        }
        if (
          !Array.isArray(result.emails) ||
          !result.emails.every((email) => typeof email === 'string')
        ) {
          throw new Error('Invalid email list response.');
        }
        if (!cancelled) {
          setEmails(result.emails);
        }
      } catch {
        if (!cancelled) {
          setEmails([]);
          setError('Unable to load user email addresses. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadEmails();
    return () => {
      cancelled = true;
    };
  }, [action.name, resource.id, selectedCategories]);

  const emailText = emails.join('; ');
  const toggleCategory = (category: UserEmailCategory) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter(
            (currentCategory) => currentCategory !== category,
          )
        : [...currentCategories, category],
    );
  };

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(emailText);
      setCopyFeedback({
        message: `Copied ${emails.length} email addresses.`,
        isError: false,
      });
    } catch {
      setCopyFeedback({
        message: 'Unable to copy the list. Please copy the addresses manually.',
        isError: true,
      });
    }
  };

  return (
    <Box variant="grey">
      <Box variant="white">
        <H2>Email Users</H2>
        <Text mb="sm">Select one or more recipient categories:</Text>
        <Box flex flexWrap="wrap" alignItems="center" mb="lg">
          {RECIPIENT_CATEGORIES.map(({ value, label }) => {
            const id = `email-recipient-${value}`;
            return (
              <Box key={value} flex alignItems="center" mr="xl">
                <CheckBox
                  id={id}
                  checked={selectedCategories.includes(value)}
                  onChange={() => toggleCategory(value)}
                />
                <Label htmlFor={id} inline ml="default">
                  {label}
                </Label>
              </Box>
            );
          })}
        </Box>
        {isLoading ? (
          <Text>Loading user email addresses...</Text>
        ) : error ? (
          <Text color="error">{error}</Text>
        ) : (
          <>
            <Box
              flex
              alignItems="center"
              justifyContent="space-between"
              mb="sm"
            >
              <Text aria-live="polite" role="status">
                Unique recipients: {emails.length}
              </Text>
              <Button
                onClick={copyEmails}
                disabled={!emailText}
                variant="outlined"
              >
                Copy emails
              </Button>
            </Box>
            {copyFeedback && (
              <Text
                color={copyFeedback.isError ? 'error' : 'grey60'}
                role="status"
              >
                {copyFeedback.message}
              </Text>
            )}
            {emailText ? (
              <textarea
                aria-label="Recipient email addresses"
                readOnly
                value={emailText}
                rows={Math.min(
                  12,
                  Math.max(4, Math.ceil(emailText.length / 100)),
                )}
                style={{
                  boxSizing: 'border-box',
                  font: 'inherit',
                  lineHeight: 1.5,
                  padding: '0.75rem',
                  resize: 'vertical',
                  width: '100%',
                }}
              />
            ) : (
              <Text>No email addresses match the selected categories.</Text>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default EmailUsers;
