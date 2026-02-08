import React from 'https://esm.sh/react@18.3.1'

interface PasswordChangedEmailProps {
  email: string
  changed_at: string
  ip_address?: string | null
}

export const PasswordChangedEmail: React.FC<PasswordChangedEmailProps> = ({
  email,
  changed_at,
  ip_address,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Changed - Zikalyze</title>
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
            background: 'linear-gradient(135deg, #6effc0 0%, #3de6a0 100%)',
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
              🔐
            </div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '20px 0 0 0',
            }}>
              Password Changed Successfully
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
              Your Zikalyze account password has been successfully changed. This is a confirmation that your password update was completed.
            </p>

            {/* Details Box */}
            <div style={{
              backgroundColor: '#1c1c2e',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #2a2a3e',
              marginBottom: '20px',
            }}>
              <h3 style={{
                color: '#6effc0',
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 15px 0',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
              }}>
                Change Details
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#9ca3af', padding: '8px 0', fontSize: '14px' }}>Account:</td>
                    <td style={{ color: '#e5e5e5', padding: '8px 0', fontSize: '14px', textAlign: 'right' as const }}>{email}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#9ca3af', padding: '8px 0', fontSize: '14px' }}>Changed At:</td>
                    <td style={{ color: '#22d3ee', padding: '8px 0', fontSize: '14px', textAlign: 'right' as const }}>{changed_at}</td>
                  </tr>
                  {ip_address && (
                    <tr>
                      <td style={{ color: '#9ca3af', padding: '8px 0', fontSize: '14px' }}>IP Address:</td>
                      <td style={{ color: '#e5e5e5', padding: '8px 0', fontSize: '14px', textAlign: 'right' as const, fontFamily: 'monospace' }}>{ip_address}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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
                ✅ What This Means
              </h4>
              <ul style={{
                color: '#9ca3af',
                fontSize: '13px',
                lineHeight: '1.8',
                margin: 0,
                paddingLeft: '20px',
              }}>
                <li>Your new password is now active</li>
                <li>Previous password will no longer work</li>
                <li>Active sessions remain logged in</li>
              </ul>
            </div>

            <p style={{
              color: '#f87171',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0 0 20px 0',
              padding: '15px',
              backgroundColor: 'rgba(248, 113, 113, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(248, 113, 113, 0.2)',
            }}>
              <strong>⚠️ Didn't change your password?</strong><br />
              If you didn't make this change, your account may be compromised. Please contact support immediately and secure your account.
            </p>

            {/* Action Box */}
            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #1e3a5f',
            }}>
              <h4 style={{
                color: '#22d3ee',
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 12px 0',
              }}>
                🛡️ Security Recommendations
              </h4>
              <ul style={{
                color: '#9ca3af',
                fontSize: '13px',
                lineHeight: '1.8',
                margin: 0,
                paddingLeft: '20px',
              }}>
                <li>Enable Two-Factor Authentication for extra security</li>
                <li>Review active sessions in your Settings</li>
                <li>Use a unique password not used elsewhere</li>
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
              This is an automated security notification from Zikalyze.<br />
              © {new Date().getFullYear()} Zikalyze. AI-Powered Crypto Analytics.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
