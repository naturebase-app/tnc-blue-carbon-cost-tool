import React from 'react';
import { Box, H1, Text } from '@adminjs/design-system';

const Dashboard = () => {
  return (
    <Box variant="grey">
      <Box
        variant="white"
        flex
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p="xxl"
      >
        <H1>Welcome to Blue Carbon Cost Admin Panel</H1>
        <Text>Manage your data effectively and efficiently</Text>
      </Box>
    </Box>
  );
};

export default Dashboard;
