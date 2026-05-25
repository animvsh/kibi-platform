
import React from 'react';
import { Card } from "@/components/ui/card";
import { getModuleIcon, getModuleTypeLabel } from '../ModuleTypeBadge';
import { SimulationModuleProps } from '@/types/course';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const SimulationModule: React.FC<SimulationModuleProps> = ({ module, moduleIdx, onComplete, isCompleted }) => {
  return (
    <Card className="p-4 border-2 border-dark-100 bg-dark-300 mb-6">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <div className="bg-kibi-600/60 p-2 rounded-full">
            {getModuleIcon(module.type)}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-bold">{module.title}</h5>
            {getModuleTypeLabel(module.type)}
          </div>
          
          {module.description && (
            <div className="text-gray-300 mt-2">
              <p>{typeof module.description === 'string' ? module.description : String(module.description)}</p>
            </div>
          )}
          
          {!isCompleted && (
            <div className="flex justify-end mt-4">
              <Button onClick={onComplete} className="bg-kibi-500 hover:bg-kibi-600">
                Mark as Complete
              </Button>
            </div>
          )}
          
          {isCompleted && (
            <div className="flex items-center justify-end mt-4 text-green-500">
              <CheckCircle className="mr-2 h-5 w-5" />
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SimulationModule;
