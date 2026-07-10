'use client';

import { UserProfile } from '@clerk/nextjs';
import { Palette } from 'lucide-react';

export const UserProfileWithAppearance = (props: {
  path: string;
  appearanceLabel: string;
  appearanceContent: React.ReactNode;
}) => {
  return (
    <UserProfile appearance={{ variables: { colorForeground: 'black' } }} path={props.path}>
      <UserProfile.Page
        label={props.appearanceLabel}
        labelIcon={<Palette className="size-4" />}
        url="appearance"
      >
        {props.appearanceContent}
      </UserProfile.Page>
    </UserProfile>
  );
};
