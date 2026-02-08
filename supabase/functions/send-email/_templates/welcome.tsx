import React from 'https://esm.sh/react@18.3.1'

interface WelcomeEmailProps {
  email: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ email }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Zikalyze</title>
      </head>
      <body style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        backgroundColor: '#0a0a0f',
        margin: 0,
        padding: '40px 20px',
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#12121a',
          borderRadius: '16px',
          border: '1px solid #1e1e2e',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
            padding: '30px',
            textAlign: 'center' as const,
          }}>
            <div style={{
              display: 'inline-block',
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              lineHeight: '60px',
              fontSize: '28px',
            }}>
              📊
            </div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '20px 0 0 0',
            }}>
              Welcome to Zikalyze! 🎉
            </h1>
          </div>

          {/* Content */}
          <div style={{ padding: '30px' }}>
            <p style={{
              color: '#e5e5e5',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0 0 20px 0',
            }}>
              Your account has been successfully created. You're now part of the Zikalyze community with access to AI-powered crypto analytics.
            </p>

            {/* Account Info */}
            <div style={{
              backgroundColor: '#1c1c2e',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #2a2a3e',
              marginBottom: '20px',
            }}>
              <h3 style={{
                color: '#22d3ee',
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 15px 0',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
              }}>
                ✅ Account Confirmed
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#9ca3af', padding: '8px 0', fontSize: '14px' }}>Email:</td>
                    <td style={{ color: '#e5e5e5', padding: '8px 0', fontSize: '14px', textAlign: 'right' as const }}>{email}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#9ca3af', padding: '8px 0', fontSize: '14px' }}>Status:</td>
                    <td style={{ color: '#6effc0', padding: '8px 0', fontSize: '14px', textAlign: 'right' as const }}>Active ✓</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Features */}
            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #1e3a5f',
              marginBottom: '20px',
            }}>
              <h4 style={{
                color: '#22d3ee',
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 12px 0',
              }}>
                🚀 What You Can Do Now
              </h4>
              <ul style={{
                color: '#9ca3af',
                fontSize: '13px',
                lineHeight: '1.8',
                margin: 0,
                paddingLeft: '20px',
              }}>
                <li>Track real-time cryptocurrency prices</li>
                <li>Get AI-powered market analysis and predictions</li>
                <li>Set custom price alerts for any crypto</li>
                <li>View on-chain metrics and smart money flows</li>
                <li>Analyze market sentiment and trends</li>
              </ul>
            </div>

            {/* Security Tips */}
            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #1e3a5f',
            }}>
              <h4 style={{
                color: '#fbbf24',
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 12px 0',
              }}>
                🛡️ Secure Your Account
              </h4>
              <ul style={{
                color: '#9ca3af',
                fontSize: '13px',
                lineHeight: '1.8',
                margin: 0,
                paddingLeft: '20px',
              }}>
                <li>Enable Two-Factor Authentication (2FA) in Settings</li>
                <li>Use a strong, unique password</li>
                <li>Keep your recovery codes safe</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #1e1e2e',
            padding: '20px 30px',
            textAlign: 'center' as const,
          }}>
            <p style={{
              color: '#6b7280',
              fontSize: '12px',
              margin: 0,
            }}>
              Welcome aboard! If you have questions, just reply to this email.<br />
              © {new Date().getFullYear()} Zikalyze. AI-Powered Crypto Analytics.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
