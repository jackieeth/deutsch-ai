"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

interface FaceExpressions {
  nodding: boolean;
  headTilted: boolean;
  confused: boolean;
  happiness: number;
  sadness: number;
  anger: number;
  surprise: number;
  neutral: number;
}

interface FaceDetectionProps {
  onExpressionChange?: (expressions: FaceExpressions) => void;
  className?: string;
}

export function FaceDetection({ onExpressionChange, className }: FaceDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [expressions, setExpressions] = useState<FaceExpressions>({
    nodding: false,
    headTilted: false,
    confused: false,
    happiness: 0,
    sadness: 0,
    anger: 0,
    surprise: 0,
    neutral: 0,
  });

  // Track head positions for nodding detection
  const headPositions = useRef<number[]>([]);
  const lastHeadRotation = useRef<{ pitch: number; yaw: number; roll: number }>({ 
    pitch: 0, 
    yaw: 0, 
    roll: 0 
  });

  const loadModels = useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading face-api models:', error);
    }
  }, []);

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error starting video:', error);
    }
  }, []);

  const stopVideo = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const detectExpressions = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length > 0) {
        const detection = detections[0];
        const { expressions, landmarks } = detection;

        // Clear previous drawings
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Resize detections to match display
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Draw face landmarks
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        // Calculate head pose for nodding and tilting detection
        const nose = landmarks.getNose();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        
        // Calculate head rotation angles
        const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
        const eyeCenterY = (leftEye[0].y + rightEye[3].y) / 2;
        const noseX = nose[3].x;
        const noseY = nose[3].y;
        
        // Calculate pitch (nodding) - vertical movement
        const pitch = Math.atan2(noseY - eyeCenterY, Math.abs(noseX - eyeCenterX)) * 180 / Math.PI;
        
        // Calculate roll (head tilt) - rotation around z-axis
        const roll = Math.atan2(rightEye[3].y - leftEye[0].y, rightEye[3].x - leftEye[0].x) * 180 / Math.PI;
        
        // Calculate yaw (left/right turn)
        const yaw = Math.atan2(noseX - eyeCenterX, Math.abs(noseY - eyeCenterY)) * 180 / Math.PI;

        // Track head positions for nodding detection
        headPositions.current.push(pitch);
        if (headPositions.current.length > 10) {
          headPositions.current.shift();
        }

        // Detect nodding (up and down movement)
        const isNodding = headPositions.current.length >= 5 && 
          Math.max(...headPositions.current) - Math.min(...headPositions.current) > 15;

        // Detect head tilt (significant roll angle)
        const isHeadTilted = Math.abs(roll) > 7;

        // Detect confusion (combination of expressions and head movements)
        const isConfused = expressions.disgusted > 0.3 || 
          expressions.surprised > 0.4 || 
          (expressions.neutral < 0.3 && expressions.happy < 0.3);

        const newExpressions: FaceExpressions = {
          nodding: isNodding,
          headTilted: isHeadTilted,
          confused: isConfused,
          happiness: expressions.happy,
          sadness: expressions.sad,
          anger: expressions.angry,
          surprise: expressions.surprised,
          neutral: expressions.neutral,
        };

        setExpressions(newExpressions);
        onExpressionChange?.(newExpressions);

        // Update last head rotation
        lastHeadRotation.current = { pitch, yaw, roll };
      }
    } catch (error) {
      console.error('Error detecting faces:', error);
    }
  }, [isLoaded, onExpressionChange]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    if (isLoaded && isDetecting) {
      startVideo();
    } else if (!isDetecting) {
      stopVideo();
    }
  }, [isLoaded, isDetecting, startVideo, stopVideo]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isDetecting && isLoaded) {
      intervalId = setInterval(detectExpressions, 100); // Detect every 100ms
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isDetecting, isLoaded, detectExpressions]);

  const toggleDetection = () => {
    setIsDetecting(!isDetecting);
  };

  // Helper function to get color intensity based on expression value
  const getExpressionColor = (value: number, baseColor: string) => {
    const intensity = Math.round(value * 255);
    switch (baseColor) {
      case 'yellow': // happiness
        return `rgb(255, 255, ${Math.max(0, 255 - intensity)})`;
      case 'blue': // sadness
        return `rgb(${Math.max(0, 255 - intensity)}, ${Math.max(0, 255 - intensity)}, 255)`;
      case 'red': // anger
        return `rgb(255, ${Math.max(0, 255 - intensity)}, ${Math.max(0, 255 - intensity)})`;
      case 'orange': // surprise
        return `rgb(255, ${Math.max(128, 255 - intensity/2)}, ${Math.max(0, 255 - intensity)})`;
      default:
        return 'rgb(128, 128, 128)';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-auto rounded-lg"
          onLoadedMetadata={() => {
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      
      <div className="mt-4 space-y-2">
        <button
          onClick={toggleDetection}
          disabled={!isLoaded}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isDetecting ? 'Stop Detection' : 'Start Detection'}
        </button>
        
        {!isLoaded && (
          <p className="text-sm text-gray-500">Loading face detection models...</p>
        )}
        
        {false && isDetecting && (
          <div className="flex gap-2 mt-3">
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-black border-2 border-gray-300"
              style={{ backgroundColor: getExpressionColor(expressions.happiness, 'yellow') }}
            >
              😊
            </div>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white border-2 border-gray-300"
              style={{ backgroundColor: getExpressionColor(expressions.sadness, 'blue') }}
            >
              �
            </div>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-white border-2 border-gray-300"
              style={{ backgroundColor: getExpressionColor(expressions.anger, 'red') }}
            >
              �
            </div>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold text-black border-2 border-gray-300"
              style={{ backgroundColor: getExpressionColor(expressions.surprise, 'orange') }}
            >
              😲
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
