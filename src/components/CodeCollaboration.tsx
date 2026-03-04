import React from 'react';
import { VSCodeEditor } from './VSCodeEditor';

interface CodeCollaborationProps {
  user: any;
  workspace: any;
}

export const CodeCollaboration: React.FC<CodeCollaborationProps> = ({ user, workspace }) => {
  return (
    <div className="h-full">
      <VSCodeEditor user={user} workspace={workspace} />
    </div>
  );
};
