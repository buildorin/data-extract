import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { createLiveShare } from '../../services/liveShareApi';
import { toast } from 'react-hot-toast';
import { Flex, Text, Button, RadioGroup } from '@radix-ui/themes';

interface CreateLiveShareModalProps {
  dealId: string;
  dealName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLiveShareModal({
  dealId,
  dealName,
  isOpen,
  onClose,
}: CreateLiveShareModalProps) {
  const [expiresInDays, setExpiresInDays] = useState<7 | 30>(7);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateLiveShareModal.tsx:25',message:'Calling createLiveShare',data:{dealId,expiresInDays,requestObject:{deal_id:dealId,expires_in_days:expiresInDays}},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      return createLiveShare({ deal_id: dealId, expires_in_days: expiresInDays });
    },
    onSuccess: (data) => {
      setShareUrl(data.share_url);
      queryClient.invalidateQueries('liveShares');
      toast.success('Live share created!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create share');
    },
  });

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '448px',
          width: '100%',
          padding: '24px',
        }}
      >
        <Text size="5" weight="bold" style={{ marginBottom: '8px', display: 'block' }}>
          Share {dealName}
        </Text>

        {!shareUrl ? (
          <>
            <Text size="2" style={{ color: '#666', marginBottom: '16px', display: 'block' }}>
              Create a shareable link that anyone can view. You can track views
              and manage investor interest from your dashboard.
            </Text>

            <Flex direction="column" gap="12px" style={{ marginBottom: '24px' }}>
              <Text size="2" weight="medium" style={{ color: '#333' }}>
                Link expires in:
              </Text>

              <RadioGroup.Root
                value={expiresInDays.toString()}
                onValueChange={(value) => setExpiresInDays(value === '7' ? 7 : 30)}
              >
                <Flex direction="column" gap="8px">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <RadioGroup.Item value="7" />
                    <Text size="2" style={{ color: '#333' }}>1 week</Text>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <RadioGroup.Item value="30" />
                    <Text size="2" style={{ color: '#333' }}>1 month</Text>
                  </label>
                </Flex>
              </RadioGroup.Root>
            </Flex>

            <Flex justify="end" gap="12px">
              <Button
                variant="soft"
                onClick={handleClose}
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                style={{
                  cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: createMutation.isPending ? 0.5 : 1,
                }}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Link'}
              </Button>
            </Flex>
          </>
        ) : (
          <>
            <Text size="2" style={{ color: '#666', marginBottom: '16px', display: 'block' }}>
              Your shareable link is ready!
            </Text>

            <div
              style={{
                backgroundColor: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                wordBreak: 'break-all',
                fontSize: '14px',
              }}
            >
              {shareUrl}
            </div>

            <Flex justify="end" gap="12px">
              <Button
                variant="soft"
                onClick={handleClose}
                style={{ cursor: 'pointer' }}
              >
                Close
              </Button>
              <Button
                onClick={handleCopyLink}
                style={{ cursor: 'pointer' }}
              >
                Copy Link
              </Button>
            </Flex>
          </>
        )}
      </div>
    </div>
  );
}
