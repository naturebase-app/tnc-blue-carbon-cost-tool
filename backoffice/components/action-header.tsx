import React from 'react';
import { OriginalActionHeader, type ActionHeaderProps } from 'adminjs';

const ActionHeader = (props: ActionHeaderProps) => {
  if (props.resource.id !== 'User' || props.action.name !== 'emailUsers') {
    return <OriginalActionHeader {...props} />;
  }

  const resource = {
    ...props.resource,
    resourceActions: props.resource.resourceActions.filter(
      ({ name }) => name !== 'new',
    ),
  };

  return <OriginalActionHeader {...props} resource={resource} />;
};

export default ActionHeader;
