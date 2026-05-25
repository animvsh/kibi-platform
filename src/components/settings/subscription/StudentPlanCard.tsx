
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

interface StudentPlanCardProps {
  onSubscribe: () => void;
}

const StudentPlanCard = ({ onSubscribe }: StudentPlanCardProps) => {
  return (
    <Card className={`bg-dark-300 border-4 border-dark-200 hover:border-kibi-500 transition-all duration-300`}>
      <div className="p-6">
        <div className="flex items-center mb-2">
          <div className="bg-kibi-500/20 p-2 rounded-full mr-2">
            <GraduationCap className="h-6 w-6 text-kibi-400" />
          </div>
          <h3 className="text-xl font-bold text-white">🎓 Student Plan</h3>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-gray-300 mb-3">Verify with .edu email to get Pro features at a student discount</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-white">$50</p>
              <span className="text-sm font-normal text-gray-400">/ year</span>
            </div>
            <p className="text-kibi-400 font-medium">Only $4.17 per month</p>
          </div>
          <Button
            onClick={onSubscribe}
            className="md:ml-4 mt-4 md:mt-0 bg-gradient-to-r from-kibi-500 to-kibi-700 hover:from-kibi-600 hover:to-kibi-800 text-white shadow-lg"
            size="lg"
          >
            Verify & Subscribe
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default StudentPlanCard;
