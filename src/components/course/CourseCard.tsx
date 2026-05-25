
import React, { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, User, Tag, Crown } from 'lucide-react';
import { trackCourseInteraction } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CourseCardProps {
  id: string;
  title: string;
  metadata: {
    tags: string[];
    level: string;
    duration: string;
    created_by?: string;
    topics?: string[];
  };
  share_token: string;
  isPaid?: boolean;
  authorName?: string;
  authorAvatar?: string;
}

const CourseCard = ({ 
  id, 
  title, 
  metadata, 
  share_token, 
  isPaid = false,
  authorName,
  authorAvatar
}: CourseCardProps) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          trackCourseInteraction(id, 'view');
          observer.disconnect();
        }
      });
    });

    const element = document.getElementById(`course-card-${id}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [id]);

  // Format some metadata fallbacks
  const level = metadata.level || 'beginner';
  const duration = metadata.duration || '1h';
  const tags = metadata.tags && metadata.tags.length > 0 
    ? metadata.tags 
    : (metadata.topics && metadata.topics.length > 0 ? metadata.topics : ['Course']);
  const authorDisplay = authorName || metadata.created_by || 'Unknown Author';
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card 
      id={`course-card-${id}`} 
      className="bg-dark-400 border-2 border-dark-300 hover:border-kibi-600 transition-all h-full flex flex-col"
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge className={`${
            level === 'advanced' ? 'bg-red-600' : 
            level === 'intermediate' ? 'bg-yellow-600' : 
            'bg-kibi-600'
          } mb-2`}>
            {level}
          </Badge>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              {duration}
            </Badge>
            {isPaid && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-xl text-kibi-300">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="bg-dark-300">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" className="bg-dark-300">
              +{tags.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center text-gray-400 text-sm mt-auto">
          <Avatar className="h-6 w-6 mr-2">
            {authorAvatar ? (
              <AvatarImage src={authorAvatar} alt={authorDisplay} />
            ) : (
              <AvatarFallback className="bg-kibi-600 text-xs">
                {getInitials(authorDisplay)}
              </AvatarFallback>
            )}
          </Avatar>
          <span>Created by {authorDisplay}</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button asChild className="w-full bg-kibi-500 hover:bg-kibi-600">
          <Link to={`/course/${id}`} className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            View Course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
