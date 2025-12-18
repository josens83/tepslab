import React, { useState, useEffect } from 'react';
import { TwoFactorService } from '../../services/twoFactorService';
import './TwoFactorAuth.css';

export const TwoFactorAuth: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'status' | 'setup' | 'verify'>('status');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const status = await TwoFactorService.getStatus();
      setIsEnabled(status);
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
    }
  };

  const handleSetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await TwoFactorService.setup();
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep('setup');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await TwoFactorService.enable(verificationCode);
      setSuccess('Two-factor authentication has been enabled successfully!');
      setIsEnabled(true);
      setStep('status');
      setVerificationCode('');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    const code = prompt('Enter your 2FA code to disable:');
    if (!code) return;

    setIsLoading(true);
    setError('');

    try {
      await TwoFactorService.disable(code);
      setSuccess('Two-factor authentication has been disabled');
      setIsEnabled(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    const code = prompt('Enter your 2FA code to regenerate backup codes:');
    if (!code) return;

    setIsLoading(true);
    setError('');

    try {
      const newCodes = await TwoFactorService.regenerateBackupCodes(code);
      setBackupCodes(newCodes);
      setSuccess('Backup codes have been regenerated');
      setStep('setup'); // Show backup codes
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to regenerate backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tepslab-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'status') {
    return (
      <div className="two-factor-auth">
        <h2>Two-Factor Authentication</h2>
        <p className="description">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="status-card">
          <div className="status-info">
            <span className={`status-badge ${isEnabled ? 'enabled' : 'disabled'}`}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <p>
              {isEnabled
                ? 'Your account is protected with two-factor authentication.'
                : 'Enable 2FA to add an extra layer of security to your account.'}
            </p>
          </div>

          <div className="actions">
            {isEnabled ? (
              <>
                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={isLoading}
                  className="btn btn-secondary"
                >
                  Regenerate Backup Codes
                </button>
                <button
                  onClick={handleDisable}
                  disabled={isLoading}
                  className="btn btn-danger"
                >
                  Disable 2FA
                </button>
              </>
            ) : (
              <button
                onClick={handleSetup}
                disabled={isLoading}
                className="btn btn-primary"
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="two-factor-auth">
        <h2>Setup Two-Factor Authentication</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="setup-steps">
          <div className="step">
            <h3>Step 1: Scan QR Code</h3>
            <p>Use Google Authenticator, Authy, or any TOTP app to scan this QR code:</p>
            {qrCodeUrl && (
              <div className="qr-code">
                <img src={qrCodeUrl} alt="2FA QR Code" />
              </div>
            )}
            <p className="secret-text">
              Or enter this code manually: <code>{secret}</code>
            </p>
          </div>

          <div className="step">
            <h3>Step 2: Save Backup Codes</h3>
            <p>
              Save these backup codes in a secure location. You can use them to access your
              account if you lose your device.
            </p>
            <div className="backup-codes">
              {backupCodes.map((code, index) => (
                <code key={index}>{code}</code>
              ))}
            </div>
            <button onClick={downloadBackupCodes} className="btn btn-secondary">
              Download Backup Codes
            </button>
          </div>

          <div className="step">
            <h3>Step 3: Verify</h3>
            <p>Enter the 6-digit code from your authenticator app:</p>
            <form onSubmit={handleEnable}>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                className="code-input"
              />
              <div className="button-group">
                <button
                  type="button"
                  onClick={() => setStep('status')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
