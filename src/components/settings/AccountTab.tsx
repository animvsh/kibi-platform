
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AccountTab = () => {
  return (
    <Card className="bg-dark-400 border-4 border-dark-300">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Account Settings</CardTitle>
        <CardDescription>Manage your account details</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">Account settings coming soon</p>
      </CardContent>
    </Card>
  );
};

export default AccountTab;
