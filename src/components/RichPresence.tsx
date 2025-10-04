"use client";

import { useState, useEffect } from "react";
import { LuClock, LuUsers } from "react-icons/lu";

export const ActivityType = {
  Playing: 0,
  Streaming: 1,
  Listening: 2,
  Watching: 3,
  Custom: 4,
  Competing: 5,
} as const;

type ActivityTypeValue = (typeof ActivityType)[keyof typeof ActivityType];

interface DiscordRichPresenceProps {
  activityType?: ActivityTypeValue;
  title: string;
  details?: string;
  state?: string;
  largeImageKey?: string;
  smallImageKey?: string;
  startTimestamp?: number;
  partySize?: number;
  partyMax?: number;
  joinSecret?: string;
  showAskToJoin?: boolean;
  button1Text?: string;
  button1Url?: string;
  button2Text?: string;
  button2Url?: string;
}

function getActivityTypeLabel(type: ActivityTypeValue): string {
  const labels = {
    [ActivityType.Playing]: "Playing",
    [ActivityType.Streaming]: "Streaming",
    [ActivityType.Listening]: "Listening to",
    [ActivityType.Watching]: "Watching",
    [ActivityType.Custom]: "Custom Status",
    [ActivityType.Competing]: "Competing in",
  };
  return labels[type] || "Playing";
}

function formatElapsedTime(startTimestamp: number): string {
  const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function DiscordRichPresence({
  activityType = ActivityType.Playing,
  title,
  details,
  state,
  largeImageKey = "/discord-app-icon.jpg",
  smallImageKey,
  startTimestamp,
  partySize,
  partyMax,
  joinSecret,
  showAskToJoin = true,
  button1Text,
  button1Url,
  button2Text,
  button2Url,
}: DiscordRichPresenceProps) {
  const [elapsedTime, setElapsedTime] = useState<string>("");

  useEffect(() => {
    if (!startTimestamp) return;

    const updateTime = () => {
      setElapsedTime(formatElapsedTime(startTimestamp));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [startTimestamp]);

  const hasPartyInfo = partySize !== undefined && partyMax !== undefined;

  return (
    <div className="w-[300px] rounded-lg bg-[#2b2d31] p-3 font-sans text-sm">
      {/* Activity Type Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#b5bac1]">
          {getActivityTypeLabel(activityType)}
        </span>
        <div className="text-[#b5bac1] hover:text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-3">
        {/* Image Container */}
        <div className="relative h-20 w-20 flex-shrink-0">
          <img
            src={largeImageKey || "/placeholder.svg"}
            alt="Activity"
            className="h-full w-full rounded-lg object-cover"
          />
          {smallImageKey && (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-[#2b2d31] bg-[#2b2d31]">
              <img
                src={smallImageKey || "/placeholder.svg"}
                alt="Status"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 overflow-hidden">
          <h3 className="truncate font-semibold text-white">{title}</h3>
          {details && (
            <p className="truncate text-xs text-[#b5bac1]">{details}</p>
          )}
          {state && <p className="truncate text-xs text-[#b5bac1]">{state}</p>}

          {/* Metadata Row */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#b5bac1]">
            {startTimestamp && elapsedTime && (
              <div className="flex items-center gap-1">
                <LuClock className="h-3 w-3" />
                <span>{elapsedTime}</span>
              </div>
            )}
            {hasPartyInfo && (
              <div className="flex items-center gap-1">
                <LuUsers className="h-3 w-3" />
                <span>
                  In a Group ({partySize} of {partyMax})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {button1Text && button1Url && (
        <a
          href={button1Url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm mt-3 w-full bg-[#4e5058] text-sm font-medium text-white hover:bg-[#5c5e66] border-none flex flex-row items-center justify-center h-8"
        >
          {button1Text}
        </a>
      )}

      {button2Text && button2Url && (
        <a
          href={button2Url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm mt-2 w-full bg-[#4e5058] text-sm font-medium text-white hover:bg-[#5c5e66] border-none flex flex-row items-center justify-center h-8"
        >
          {button2Text}
        </a>
      )}

      {/* Ask to Join Button */}
      {showAskToJoin && joinSecret && (
        <button className="btn btn-sm mt-2 w-full bg-[#4e5058] text-sm font-medium text-white hover:bg-[#5c5e66] border-none flex flex-row items-center justify-center h-8">
          <LuUsers className="h-4 w-4 mr-3" />
          Ask to Join
        </button>
      )}
    </div>
  );
}
