
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyTab = () => {
  return (
    <Card className="bg-dark-400 border-4 border-dark-300">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Privacy & Security</CardTitle>
        <CardDescription>Manage your privacy and security settings</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">Privacy settings coming soon</p>
      </CardContent>
    </Card>
  );
};

export default PrivacyTab;
