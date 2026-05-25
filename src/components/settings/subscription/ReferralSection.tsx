
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReferralSectionProps {
  onCopyReferral: () => void;
}

const ReferralSection = ({ onCopyReferral }: ReferralSectionProps) => {
  return (
    <Card className="bg-dark-400 border-4 border-dark-300">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Refer & Earn Sessions</CardTitle>
        <CardDescription>Invite friends to earn more free sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="text-gray-300 mb-4">Share your referral link and earn +1 free session for each friend who signs up</p>
            <div className="bg-dark-300 p-3 rounded-lg text-gray-400 text-sm mb-4 overflow-hidden whitespace-nowrap overflow-ellipsis">
              https://kibi.learn/ref/{window.location.host?.substring(0, 8)}
            </div>
          </div>
          <Button onClick={onCopyReferral} variant="outline">
            Copy Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSection;
