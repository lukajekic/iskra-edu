import { Group, Paper, Text } from '@mantine/core';
import React from 'react';

interface ActionGroupProps {
    title?: string,
  children: React.ReactNode;
}

const ActionButtonsBlock = ({title, children }: ActionGroupProps) => {
  return (
    <div>
      <Paper withBorder shadow='sm' w={'fit-content'} p={'7px'} px={'10px'} pb={'10px'}>
        <Text>{title ?? "Dostupne akcije"}</Text>
        <Group gap="sm" align="center" mt={'xs'}>
        {children}
      </Group>
      </Paper>
    </div>
  );
};

export default ActionButtonsBlock;