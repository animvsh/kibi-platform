
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import HomeLayout from '@/components/home/HomeLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Video, Code, PenTool, CheckCircle, BookOpen } from 'lucide-react';

const CourseDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  // Get course data from navigation state
  const { courseContent, outline } = location.state || {};
  
  console.log("CourseDashboard loaded with:", { courseContent, outline, courseId });

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'lecture':
        return <Video className="h-4 w-4 text-purple-500" />;
      case 'code':
        return <Code className="h-4 w-4 text-green-500" />;
      case 'quiz':
        return <PenTool className="h-4 w-4 text-orange-500" />;
      case 'review':
        return <CheckCircle className="h-4 w-4 text-kibi-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getModuleTypeLabel = (type: string) => {
    const labels: Record<string, { bg: string; text: string; label: string }> = {
      article: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Article' },
      lecture: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Lecture' },
      code: { bg: 'bg-green-100', text: 'text-green-700', label: 'Code' },
      quiz: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Quiz' },
      review: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Review' }
    };

    const style = labels[type] || { bg: 'bg-kibi-100', text: 'text-kibi-700', label: 'Module' };
    return (
      <Badge variant="outline" className={`${style.bg} ${style.text}`}>
        {style.label}
      </Badge>
    );
  };

  if (!courseContent) {
    return (
      <HomeLayout>
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="bg-dark-400 p-6 rounded-xl border-4 border-kibi-600 text-center">
            <h3 className="text-xl font-bold text-white mb-4">No Course Data Found</h3>
            <p className="text-gray-300 mb-6">
              Could not load course data. Please return to the module generator.
            </p>
            <Button 
              onClick={() => navigate('/module-generator')}
              className="bg-kibi-500 hover:bg-kibi-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Generator
            </Button>
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="bg-dark-400 p-6 rounded-xl border-4 border-kibi-600">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {courseContent.title}
              </h1>
              <p className="text-gray-300">
                {courseContent.description || `A comprehensive course structure with ${courseContent.modules?.length || 0} units`}
              </p>
            </div>
            <Button 
              onClick={() => navigate('/module-generator')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Generator
            </Button>
          </div>

          <div className="grid gap-6">
            {courseContent.modules && courseContent.modules.map((unit: any, unitIndex: number) => (
              <Card key={unitIndex} className="bg-dark-300 border-dark-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-kibi-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {unitIndex + 1}
                    </div>
                    {unit.title}
                  </CardTitle>
                  <p className="text-gray-400">{unit.introduction}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {unit.content && unit.content.map((subunit: any, subunitIndex: number) => (
                      <div key={subunitIndex} className="border border-dark-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 bg-kibi-600 rounded text-white text-sm flex items-center justify-center">
                            {subunitIndex + 1}
                          </div>
                          {subunit.title}
                        </h4>
                        
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                          {subunit.modules && subunit.modules.map((module: any, moduleIndex: number) => (
                            <div 
                              key={moduleIndex} 
                              className="bg-dark-400 p-3 rounded-lg border border-dark-200 hover:border-kibi-500 transition-colors"
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <div className="mt-1">
                                  {getModuleIcon(module.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-white text-sm truncate">
                                    {module.title}
                                  </h5>
                                  {getModuleTypeLabel(module.type)}
                                </div>
                              </div>
                              <p className="text-gray-400 text-xs">
                                {module.description}
                              </p>
                              {module.placeholder && (
                                <div className="mt-2 text-xs text-amber-400 italic">
                                  Content placeholder - ready for development
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="bg-dark-300 p-4 rounded-lg border border-dark-200 inline-block">
              <h3 className="text-lg font-semibold text-white mb-2">Course Structure Complete!</h3>
              <p className="text-gray-300 text-sm">
                Your course structure has been generated with placeholder modules. 
                Each module is ready for content development.
              </p>
              <div className="mt-3 text-sm text-kibi-400">
                Total Units: {courseContent.modules?.length || 0} • 
                Total Modules: {courseContent.modules?.reduce((acc: number, unit: any) => 
                  acc + (unit.content?.reduce((subAcc: number, subunit: any) => 
                    subAcc + (subunit.modules?.length || 0), 0) || 0), 0) || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default CourseDashboard;
