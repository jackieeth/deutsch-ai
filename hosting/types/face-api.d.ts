declare module 'face-api.js' {
  export interface FaceExpressions {
    angry: number;
    disgusted: number;
    fearful: number;
    happy: number;
    neutral: number;
    sad: number;
    surprised: number;
  }

  export interface FaceLandmarks {
    getNose(): Point[];
    getLeftEye(): Point[];
    getRightEye(): Point[];
    getMouth(): Point[];
    getJawOutline(): Point[];
    getLeftEyeBrow(): Point[];
    getRightEyeBrow(): Point[];
  }

  export interface Point {
    x: number;
    y: number;
  }

  export interface FaceDetection {
    detection: any;
    landmarks: FaceLandmarks;
    expressions: FaceExpressions;
  }

  export interface TinyFaceDetectorOptions {
    inputSize?: number;
    scoreThreshold?: number;
  }

  export class TinyFaceDetectorOptions {
    constructor(options?: { inputSize?: number; scoreThreshold?: number });
  }

  export function detectAllFaces(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    options?: TinyFaceDetectorOptions
  ): {
    withFaceLandmarks(): {
      withFaceExpressions(): Promise<FaceDetection[]>;
    };
  };

  export function matchDimensions(
    canvas: HTMLCanvasElement,
    displaySize: { width: number; height: number }
  ): void;

  export function resizeResults(
    detections: FaceDetection[],
    displaySize: { width: number; height: number }
  ): FaceDetection[];

  export const nets: {
    tinyFaceDetector: {
      loadFromUri(uri: string): Promise<void>;
    };
    faceLandmark68Net: {
      loadFromUri(uri: string): Promise<void>;
    };
    faceExpressionNet: {
      loadFromUri(uri: string): Promise<void>;
    };
  };

  export const draw: {
    drawFaceLandmarks(
      canvas: HTMLCanvasElement,
      detections: FaceDetection[]
    ): void;
    drawFaceExpressions(
      canvas: HTMLCanvasElement,
      detections: FaceDetection[]
    ): void;
  };
}
