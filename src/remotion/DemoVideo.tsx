import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  clipFrames, projectSchema, STUDIO_FPS, type StudioClip, type StudioProject, type StudioRecording,
} from "@/lib/studio/types";

export interface DemoVideoProps {
  project: StudioProject;
  mediaBaseUrl?: string;
}

function cursorAt(recording: StudioRecording, time: number) {
  const points = recording.cursor;
  if (!points.length || time < points[0].time) return null;
  let low = 0;
  let high = points.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (points[mid].time <= time) low = mid;
    else high = mid - 1;
  }
  const from = points[low];
  const to = points[low + 1] ?? from;
  const progress = to.time > from.time ? Math.min(1, (time - from.time) / (to.time - from.time)) : 0;
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    clickAge: from.click ? time - from.time : Infinity,
  };
}

function DemoClip({ clip, recording, mediaBaseUrl }: {
  clip: StudioClip;
  recording: StudioRecording;
  mediaBaseUrl: string;
}) {
  const frame = useCurrentFrame();
  const frames = clipFrames(clip);
  const seconds = frame / STUDIO_FPS;
  const sourceTime = clip.in + seconds * clip.speed;
  const ramp = Math.max(1, Math.min(18, Math.floor(frames / 3)));
  const envelope = frames > 2
    ? interpolate(frame, [0, ramp, Math.max(ramp + 1, frames - ramp), frames],
      [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const ease = envelope * envelope * (3 - 2 * envelope);
  const zoom = 1 + (clip.zoom - 1) * ease;
  const cursor = clip.showCursor ? cursorAt(recording, sourceTime) : null;
  const src = mediaBaseUrl ? new URL(recording.url, mediaBaseUrl).href : recording.url;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c1320", overflow: "hidden" }}>
      <AbsoluteFill style={{
        transform: `scale(${zoom})`,
        transformOrigin: `${clip.focusX * 100}% ${clip.focusY * 100}%`,
      }}>
        <OffthreadVideo
          src={src}
          startFrom={Math.round(clip.in * STUDIO_FPS)}
          endAt={Math.max(Math.round(clip.in * STUDIO_FPS) + 1, Math.ceil(clip.out * STUDIO_FPS))}
          playbackRate={clip.speed}
          muted
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
        {clip.highlight && (
          <div style={{
            position: "absolute",
            left: `${clip.highlight.x * 100}%`, top: `${clip.highlight.y * 100}%`,
            width: `${clip.highlight.width * 100}%`, height: `${clip.highlight.height * 100}%`,
            boxSizing: "border-box", border: "3px solid #8b5cf6", borderRadius: 8,
            backgroundColor: "rgba(139,92,246,0.07)",
            boxShadow: "0 0 0 2px rgba(255,255,255,0.85)",
            opacity: interpolate(frame, [0, Math.min(8, frames)], [0, 1], { extrapolateRight: "clamp" }),
          }} />
        )}
        {cursor && (
          <div style={{ position: "absolute", left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}>
            {cursor.clickAge < 0.35 && (
              <div style={{
                position: "absolute", width: 48, height: 48, left: -24, top: -24,
                border: "3px solid #8b5cf6", borderRadius: "50%",
                opacity: 1 - cursor.clickAge / 0.35,
                transform: `scale(${0.4 + cursor.clickAge * 2})`,
              }} />
            )}
            <svg width="24" height="31" viewBox="0 0 24 31" style={{ filter: "drop-shadow(0 2px 2px #0006)" }}>
              <path d="M2 2 L2 25 L8 19 L13 29 L18 27 L13 17 L22 17 Z" fill="#ffffff" stroke="#172033" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </AbsoluteFill>
      {clip.caption && (
        <div style={{
          position: "absolute", bottom: 22, left: 80, right: 80, display: "flex", justifyContent: "center",
          fontFamily: "Arial, sans-serif", fontSize: 25, lineHeight: 1.4, textAlign: "center",
        }}>
          <span style={{ backgroundColor: "rgba(12,19,32,.88)", color: "white", padding: "8px 18px", borderRadius: 8, overflowWrap: "anywhere" }}>
            {clip.caption}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
}

export function DemoVideo({ project, mediaBaseUrl = "" }: DemoVideoProps) {
  let start = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#eef0f7" }}>
      {project.clips.map((clip) => {
        const recording = project.recordings.find((item) => item.id === clip.recordingId);
        if (!recording) throw new Error(`Missing recording for clip ${clip.id}`);
        const from = start;
        const durationInFrames = clipFrames(clip);
        start += durationInFrames;
        return (
          <Sequence key={clip.id} from={from} durationInFrames={durationInFrames}>
            <DemoClip clip={clip} recording={recording} mediaBaseUrl={mediaBaseUrl} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

export const DemoVideoEntry: React.FC<Record<string, unknown>> = (props) => {
  const project = projectSchema.parse(props.project);
  const mediaBaseUrl = typeof props.mediaBaseUrl === "string" ? props.mediaBaseUrl : "";
  return <DemoVideo project={project} mediaBaseUrl={mediaBaseUrl} />;
};
