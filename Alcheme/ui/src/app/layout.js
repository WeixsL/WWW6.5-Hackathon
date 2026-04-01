import './globals.css';
import { PrivyProvider } from '@privy-io/react-auth';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PrivyProvider
          appId="team-privy-id"
          config={{
            loginMethods: ['email', 'google'],
            appearance: {
              theme: 'dark',
              accentColor: '#6763ff',
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
