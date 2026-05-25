
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { getModuleIcon } from '../ModuleTypeBadge';
import { InteractiveLectureModuleProps } from '@/types/course';
import { Badge } from '@/components/ui/badge';
import YoutubePlayer from './youtube/YoutubePlayer';
import QuizDialog from './quiz/QuizDialog';
import VideoControls from './controls/VideoControls';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useQuizDialog } from '@/hooks/useQuizDialog';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const InteractiveLectureModule: React.FC<InteractiveLectureModuleProps> = ({ 
  module, 
  moduleIdx, 
  onComplete, 
  isCompleted 
}) => {
  const {
    player,
    currentTime,
    isPlaying,
    checkpointCompleted,
    handlePlayerReady,
    handlePlayStateChange
  } = useVideoPlayer(
    (player) => player,
    module.checkpoints || [120, 300, 480],
    handleCheckpoint
  );

  const {
    showQuiz,
    setShowQuiz,
    quizQuestions,
    selectedAnswers,
    loading,
    errorMessage,
    quizResults,
    generateQuiz,
    handleAnswerSelect,
    handleQuizSubmit,
    handleCloseQuiz
  } = useQuizDialog(module.videoId);

  async function handleCheckpoint(checkpointTime: number) {
    let transcript = "";
    if (module.transcript) {
      transcript = module.transcript
        .filter(item => item.time <= checkpointTime)
        .map(item => item.text)
        .join(' ');
    } else {
      transcript = "Video content about " + module.title;
    }
    
    await generateQuiz(transcript, module.title);
    setShowQuiz(true);
  }

  const onQuizClose = () => {
    handleCloseQuiz();
    if (player) {
      player.playVideo();
    }
  };

  return (
    <Card className="p-4 border-2 border-dark-100 bg-dark-300 mb-6">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <div className="bg-kibi-600/60 p-2 rounded-full">
            {getModuleIcon('lecture_interactive')}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-bold">{module.title}</h5>
            <Badge variant="outline" className="bg-purple-900/30 text-purple-300">Interactive Lecture</Badge>
          </div>
          
          <div className="mt-4 space-y-4">
            <YoutubePlayer 
              videoId={module.videoId}
              onPlayerReady={handlePlayerReady}
              onPlayStateChange={handlePlayStateChange}
            />
            
            <VideoControls 
              isPlaying={isPlaying}
              currentTime={currentTime}
              checkpoints={module.checkpoints || [120, 300, 480]}
              completedCheckpoints={checkpointCompleted}
            />
          </div>
          
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

      <QuizDialog 
        open={showQuiz}
        onOpenChange={setShowQuiz}
        loading={loading}
        errorMessage={errorMessage}
        quizQuestions={quizQuestions}
        selectedAnswers={selectedAnswers}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={handleQuizSubmit}
        quizResults={quizResults}
        onClose={onQuizClose}
      />
    </Card>
  );
};

export default InteractiveLectureModule;
