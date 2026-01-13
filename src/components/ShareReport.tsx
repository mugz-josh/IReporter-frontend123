import React, { useState } from 'react';
import { Share2, Copy, Mail, Twitter, Facebook, Link as LinkIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/utils/toastHelpers';

interface ShareReportProps {
  reportId: string;
  reportType: 'red-flag' | 'intervention';
  reportTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareReport: React.FC<ShareReportProps> = ({
  reportId,
  reportType,
  reportTitle,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/share/${reportType}/${reportId}`;
  const shareText = `Check out this ${reportType === 'red-flag' ? 'Red Flag' : 'Intervention'} report: ${reportTitle}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Shared: ${reportTitle}`);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Share Report</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{reportTitle}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <LinkIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-mono flex-1 truncate">{shareUrl}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              <Copy className="w-4 h-4 mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={shareViaEmail}
              className="flex items-center gap-2 h-auto py-3"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </Button>

            <Button
              variant="outline"
              onClick={shareOnTwitter}
              className="flex items-center gap-2 h-auto py-3"
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </Button>

            <Button
              variant="outline"
              onClick={shareOnFacebook}
              className="flex items-center gap-2 h-auto py-3"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </Button>

            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex items-center gap-2 h-auto py-3"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Link</span>
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Sharing helps raise awareness and encourages community action
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
