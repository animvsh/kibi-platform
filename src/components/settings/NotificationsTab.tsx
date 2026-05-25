
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotificationsTab = () => {
  return (
    <Card className="bg-dark-400 border-4 border-dark-300">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Notification Preferences</CardTitle>
        <CardDescription>Control how kibi notifies you</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">Notification settings coming soon</p>
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
