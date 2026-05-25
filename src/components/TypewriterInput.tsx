import React, { useState, useEffect, useRef } from 'react';

interface TypewriterInputProps {
  placeholderPhrases: string[];
  baseClass?: string;
  onValueChange?: (value: string) => void;
}

const TypewriterInput: React.FC<TypewriterInputProps> = ({ 
  placeholderPhrases, 
  baseClass = "",
  onValueChange 
}) => {
  const [displayText, setDisplayText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const typingSpeedRef = useRef<number>(80); // milliseconds per character when typing
  const deletingSpeedRef = useRef<number>(40); // milliseconds per character when deleting
  const pauseTimeRef = useRef<number>(1500); // pause time when word is complete
  const prefixRef = useRef<string>("learn "); // Fixed prefix "learn "

  useEffect(() => {
    if (!isTyping) return;
    
    const currentPhrase = placeholderPhrases[currentPhraseIndex];
    const targetText = prefixRef.current + currentPhrase;
    const prefixLength = prefixRef.current.length;
    
    let timeout: NodeJS.Timeout;
    
    if (!isDeleting) {
      if (displayText.length < prefixLength) {
        // Type the prefix "learn "
        timeout = setTimeout(() => {
          setDisplayText(prefixRef.current.substring(0, displayText.length + 1));
        }, typingSpeedRef.current);
      } else if (displayText.length < targetText.length) {
        // Type the current phrase
        timeout = setTimeout(() => {
          setDisplayText(targetText.substring(0, displayText.length + 1));
        }, typingSpeedRef.current);
      } else {
        // Complete phrase, pause before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTimeRef.current);
      }
    } else {
      if (displayText.length > prefixLength) {
        // Delete characters but keep the prefix
        timeout = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, deletingSpeedRef.current);
      } else {
        // Done deleting, move to next phrase
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % placeholderPhrases.length);
        }, 300);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, isDeleting, currentPhraseIndex, placeholderPhrases]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (onValueChange) {
      onValueChange(value);
    }
    
    // Stop the animation when user types
    if (value !== "" && isTyping) {
      setIsTyping(false);
    }
    // Resume animation when input is cleared
    else if (value === "" && !isTyping) {
      setIsTyping(true);
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      placeholder={isTyping ? displayText : "Enter a topic or drop a file"}
      className={`block-input rounded-xl ${baseClass}`}
    />
  );
};

export default TypewriterInput;
