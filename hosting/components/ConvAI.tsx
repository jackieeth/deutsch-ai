"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversation } from "@11labs/react";
import { cn } from "@/lib/utils";
import { FaceDetection } from "./FaceDetection";

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    console.error("Microphone permission denied");
    return false;
  }
}

async function getSignedUrl(): Promise<string> {
  const response = await fetch("/api/signed-url");
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  const data = await response.json();
  return data.signedUrl;
}

export function ConvAI() {
  const [faceExpressions, setFaceExpressions] = useState<any>(null);
  const [lastConfusedTime, setLastConfusedTime] = useState<number>(0);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [questions, setQuestions] = useState([
    "Explain what is superposition",
    "What is measurement?",
    "If I can go back in time, will I be able to come back?",
    "What is multiverse?"
  ]);
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log("Deutsch AI connected");
    },
    onDisconnect: () => {
      console.log("Deutsch AI disconnected");
    },
    onError: error => {
      console.log(error);
      alert("An error occurred during the conversation");
    },
    onMessage: message => {
      console.log(message);
    },
  });

  async function startConversation() {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert("No permission");
      return;
    }
    const signedUrl = await getSignedUrl();
    const conversationId = await conversation.startSession({ signedUrl });
    console.log(conversationId);
  }

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  // Check if user is on desktop
  React.useEffect(() => {
    const checkIfDesktop = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?=.*mobile)/i.test(userAgent);
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Consider it desktop if it's not mobile/tablet and either has no touch or has a large screen
      const isDesktopDevice = !isMobile && !isTablet && (!hasTouch || window.innerWidth >= 1024);
      setIsDesktop(isDesktopDevice);
    };

    checkIfDesktop();
    
    // Re-check on resize in case of window size changes
    window.addEventListener('resize', checkIfDesktop);
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  // Handle automatic confusion detection
  React.useEffect(() => {
    if (faceExpressions?.confused && 
        conversation.status === "connected" && 
        Date.now() - lastConfusedTime > 30000) { // Prevent spam - only trigger once every 30 seconds
      console.log("User is confused, triggering automatic response");
      setLastConfusedTime(Date.now());
      
      // Automatically ask "I do not quite get that." when user is confused
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("I do not quite get that.");
        utterance.volume = 0.8;
        utterance.rate = 1;
        utterance.pitch = 1;
        
        // Wait for any ongoing speech to finish
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
      }

      // Add "I do not quite get that." to visible questions if not already present
      const confusionQuestion = "I do not quite get that.";
      if (!questions.includes(confusionQuestion)) {
        setQuestions(prevQuestions => [...prevQuestions, confusionQuestion]);
      }
    }
  }, [faceExpressions?.confused, conversation.status, lastConfusedTime, questions]);

  const handleQuestionClick = async (question: string) => {
    console.log("Question clicked:", question);
    
    // If not connected, start the conversation first
    if (conversation.status !== "connected") {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert("Microphone permission is required to ask questions");
        return;
      }
      const signedUrl = await getSignedUrl();
      await conversation.startSession({ signedUrl });
      
      // Wait a moment for the connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // For text-based questions, we need to send them to the conversation
    // Since this is conversational AI, we'll use speech synthesis to "speak" the question
    if (conversation.status === "connected" && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.volume = 0.8; // Audible volume so the microphone picks it up
      utterance.rate = 1; // Normal speaking rate
      utterance.pitch = 1;
      
      // Wait for any ongoing speech to finish
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }

    // Replace the clicked question with a new one after a delay
    setTimeout(() => {
      const allQuestions = [
        "What is superposition?",
        "What is measurement?",
        "If I can go back in time, will I be able to come back?",
        "What is multiverse?",
        "What is quantum entanglement?",
        "How does wave function collapse work?",
        "What is the many-worlds interpretation?",
        "How do parallel universes interact?",
        "What is unitary matrix?",
        "What is schrodinger picture?",
        "How to use qubit to represent physical systems?",
        "What is quantum decoherence?",
        "I do not quite get that.",
      ];

      // Mark the current question as used
      const newUsedQuestions = [...usedQuestions, question];
      setUsedQuestions(newUsedQuestions);

      // Get available questions (not currently shown and not used)
      const availableQuestions = allQuestions.filter(q => 
        !questions.includes(q) && !newUsedQuestions.includes(q)
      );

      if (availableQuestions.length > 0) {
        // Replace the clicked question with a random available one
        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        const newQuestions = questions.map(q => q === question ? randomQuestion : q);
        setQuestions(newQuestions);
      } else {
        // If no new questions available, just remove the clicked one
        const newQuestions = questions.filter(q => q !== question);
        setQuestions(newQuestions);
      }
    }, 1500); // 1.5 second delay
  };

  return (
    <div className={"flex flex-col lg:flex-col justify-center items-start gap-4"}>
      <Card className={"rounded-3xl bg-white/10 backdrop-blur-md border-white/20 w-full max-w-md flex-shrink-0"}>
        <CardContent>
          <CardHeader>
            <CardTitle className={"text-center text-white"}>
              {conversation.status === "connected"
                ? conversation.isSpeaking
                  ? `Deutsch AI is speaking`
                  : `Deutsch AI is listening`
                : "Deutsch AI"}
            </CardTitle>
          </CardHeader>
          <div className={"flex flex-col gap-y-4 text-center"}>


            {/* <FaceDetection 
            onExpressionChange={setFaceExpressions}
            className="w-full"
          /> */}
          
          {/* Face expressions display - reserve space to prevent layout shift */}
          {false && <div className="mt-4 text-white text-sm min-h-[80px]">
            {faceExpressions ? (
              <div className="grid grid-cols-3 gap-2">
                {/* <div className={cn("p-1.5 rounded text-xs", faceExpressions.nodding ? "bg-green-500/20" : "bg-gray-500/20")}>
                  {faceExpressions.nodding ? "👍 Nodding" : "⚪ Not Nodding"}
                </div> */}
                <div className={cn("p-1.5 rounded text-xs w-full min-w-0 truncate", faceExpressions.headTilted ? "bg-yellow-500/20" : "bg-gray-500/20")}>
                  {faceExpressions.headTilted ? "Confused" : "Neutral"}
                </div>
                <div className={cn("p-1.5 rounded text-xs w-full min-w-0 truncate", faceExpressions.confused ? "bg-red-500/20" : "bg-gray-500/20")}>
                  {faceExpressions.confused ? "Disagreeing" : "Neutral"}
                </div>
                <div className="p-1.5 rounded bg-blue-500/20 text-xs w-full min-w-0 truncate">
                  😊 {(faceExpressions.happiness * 100).toFixed(0)}%
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-white/50 text-xs px-2">
                Turn on camera so that Deutsch AI can interpret your facial expressions for better interaction.
              </div>
            )}
          </div>}

            <Button
              variant={"outline"}
              className={"rounded-full bg-white/10 backdrop-blur-md text-white border-white hover:bg-white/20 hover:text-white"}
              size={"sm"}
              onClick={conversation.status === "connected" ? stopConversation : startConversation}
            >
              {conversation.status === "connected" ? "End conversation" : "Start conversation"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Question Cards - Only show when conversation is connected and user is on desktop */}
      {conversation.status === "connected" && isDesktop && (<div className="w-full max-w-md flex-shrink-0">
        
          <div className="flex flex-col gap-1">
            <Card className="rounded-3xl bg-white/10 backdrop-blur-md border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
              <CardHeader>
                <h3 className="text-sm text-white text-center font-semibold">Questions</h3>
              </CardHeader>
              <CardContent>
                
                {questions.map((question, index) => (
                  <Button
                    key={`${question}-${index}`}
                    variant="ghost"
                    className="w-full text-white/80 hover:text-white hover:bg-white/10 mb-1 last:mb-0"
                    onClick={() => handleQuestionClick(question)}
                  >
                    "{question}"
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        
      </div>)}

    </div>
  );
}
