'use client';

import { SessionProvider as Provider } from 'next-auth/react';

const SessionProvider = ({ children, session }) => (
  <Provider session={session}>{children}</Provider>
);

export default SessionProvider;
