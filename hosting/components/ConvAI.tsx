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
  
  const conversation = useConversation({
    onConnect: () => {
      console.log("connected");
    },
    onDisconnect: () => {
      console.log("disconnected");
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

  return (
    <div className={"flex flex-col lg:flex-row justify-center items-center gap-4"}>
      <Card className={"rounded-3xl bg-white/10 backdrop-blur-md border-white/20 w-full max-w-md"}>
        <CardContent>
          <CardHeader>
            <CardTitle className={"text-center text-white"}>
              {conversation.status === "connected"
                ? conversation.isSpeaking
                  ? `Deutsch AI is speaking`
                  : `Deutsch AI is listening`
                : "Disconnected"}
            </CardTitle>
          </CardHeader>
          <div className={"flex flex-col gap-y-4 text-center"}>
            <div
              className={cn(
                "orb my-16 mx-12",
                conversation.status === "connected" && conversation.isSpeaking
                  ? "orb-active animate-orb"
                  : conversation.status === "connected"
                  ? "animate-orb-slow orb-inactive"
                  : "orb-inactive"
              )}
            ></div>

            <Button
              variant={"outline"}
              className={"rounded-full bg-white/10 backdrop-blur-md text-white border-white hover:bg-white/20 hover:text-white"}
              size={"lg"}
              disabled={
                conversation !== null && conversation.status === "connected"
              }
              onClick={startConversation}
            >
              Start conversation
            </Button>
            <Button
              variant={"outline"}
              className={"rounded-full bg-white/10 backdrop-blur-md text-white border-white hover:bg-white/20 hover:text-white"}
              size={"lg"}
              disabled={conversation === null}
              onClick={stopConversation}
            >
              End conversation
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Face Detection Component */}
      <Card className={"rounded-3xl bg-white/10 backdrop-blur-md border-white/20 w-full max-w-md"}>
        <CardContent className="p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className={"text-center text-white text-lg"}>
              Facial Expression Detection
            </CardTitle>
          </CardHeader>
          <FaceDetection 
            onExpressionChange={setFaceExpressions}
            className="w-full"
          />
          {faceExpressions && (
            <div className="mt-4 text-white text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className={cn("p-2 rounded", faceExpressions.nodding ? "bg-green-500/20" : "bg-gray-500/20")}>
                  {faceExpressions.nodding ? "👍 Nodding" : "⚪ Not Nodding"}
                </div>
                <div className={cn("p-2 rounded", faceExpressions.headTilted ? "bg-yellow-500/20" : "bg-gray-500/20")}>
                  {faceExpressions.headTilted ? "🤔 Head Tilted" : "⚪ Head Straight"}
                </div>
                <div className={cn("p-2 rounded", faceExpressions.confused ? "bg-red-500/20" : "bg-gray-500/20")}>
                  {faceExpressions.confused ? "😕 Confused" : "✅ Clear"}
                </div>
                <div className="p-2 rounded bg-blue-500/20">
                  😊 {(faceExpressions.happiness * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
