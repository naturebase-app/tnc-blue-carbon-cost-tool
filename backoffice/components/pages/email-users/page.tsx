import React, { useEffect, useState } from 'react';
import { ApiClient, type ActionProps } from 'adminjs';
import { Box, H2, Text } from '@adminjs/design-system';

const adminApi = new ApiClient();

const EmailUsers = ({ resource, action }: ActionProps) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    const loadEmails = async () => {
      try {
        const response = await adminApi.resourceAction({
          resourceId: resource.id,
          actionName: action.name,
        });
        const result = response.data as { emails?: string[]; error?: string };
        if (result.error) {
          throw new Error(result.error);
        }
        if (!cancelled) {
          setEmails(result.emails ?? []);
        }
      } catch {
        if (!cancelled) {
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
  }, []);

  const emailText = emails.join('; ');

  return (
    <Box variant="grey">
      <Box variant="white">
        <H2>Email Users</H2>
        {isLoading ? (
          <Text>Loading user email addresses...</Text>
        ) : error ? (
          <Text color="error">{error}</Text>
        ) : emailText ? (
          <textarea
            aria-label="Active user email addresses"
            readOnly
            value={emailText}
            rows={Math.min(12, Math.max(4, Math.ceil(emailText.length / 100)))}
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
          <Text>No active user email addresses found.</Text>
        )}
      </Box>
    </Box>
  );
};

export default EmailUsers;
