import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactEventHandler, RefCallback } from "react";

// Origins a YouTube embed posts messages from.
const YOUTUBE_ORIGINS = ["https://www.youtube.com", "https://www.youtube-nocookie.com"];

// Player states from the YouTube IFrame API that mean the user is watching.
// Buffering counts, so nothing moves out from under a video that is still loading.
const PLAYING = 1;
const BUFFERING = 3;

// The messages a player posts back once it has been asked to listen. State
// arrives bare on a state change and nested on the periodic progress updates.
interface PlayerMessage {
  event?: string;
  info?: number | { playerState?: number };
}

export interface UseYouTubePlaybackResult {
  /** True while at least one of the registered embeds is playing or buffering. */
  isPlaying: boolean;
  /** Spread onto every YouTube iframe that should be tracked. */
  playerProps: {
    ref: RefCallback<HTMLIFrameElement>;
    onLoad: ReactEventHandler<HTMLIFrameElement>;
  };
}

/**
 * Tracks whether any YouTube embed rendered by the calling component is playing.
 *
 * Embeds must include `enablejsapi=1` in their src. Once an iframe loads we send
 * it the `listening` handshake, after which the player posts its state changes
 * back to us — so playing can be told from paused without pulling in YouTube's
 * IFrame API script. If a player never answers, `isPlaying` simply stays false
 * and the caller behaves as it did before.
 */
export const useYouTubePlayback = (): UseYouTubePlaybackResult => {
  // Every mounted embed, and the subset of those currently being watched.
  const frames = useRef(new Set<HTMLIFrameElement>());
  const watching = useRef(new Set<HTMLIFrameElement>());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!YOUTUBE_ORIGINS.includes(e.origin)) return;

      // Ignore players that belong to some other component on the page
      const sender = [...frames.current].find((frame) => frame.contentWindow === e.source);
      if (!sender) return;

      let message: PlayerMessage;
      try {
        message = (typeof e.data === "string" ? JSON.parse(e.data) : e.data) as PlayerMessage;
      } catch {
        return; // Not a message we can read, so not one we care about
      }

      let state: number | undefined;
      if (message.event === "onStateChange" && typeof message.info === "number")
        state = message.info;
      else if (message.event === "infoDelivery" && typeof message.info === "object")
        state = message.info?.playerState;

      if (state === undefined) return;

      if (state === PLAYING || state === BUFFERING) watching.current.add(sender);
      else watching.current.delete(sender);

      setIsPlaying(watching.current.size > 0);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Registers an embed with the hook, and drops it again when it unmounts
  const registerFrame: RefCallback<HTMLIFrameElement> = useCallback((frame) => {
    if (!frame) return;
    frames.current.add(frame);

    return () => {
      frames.current.delete(frame);
      // An embed that unmounts mid-video shouldn't hold the pause open forever
      watching.current.delete(frame);
      setIsPlaying(watching.current.size > 0);
    };
  }, []);

  // Asks a player to start reporting its state to us
  const startListening: ReactEventHandler<HTMLIFrameElement> = useCallback((e) => {
    const frame = e.currentTarget;
    try {
      frame.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", channel: "widget" }),
        new URL(frame.src).origin,
      );
    } catch {
      // A src we can't parse isn't a player we can listen to
    }
  }, []);

  return {
    isPlaying,
    playerProps: { ref: registerFrame, onLoad: startListening },
  };
};
