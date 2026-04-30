"use client"

import type React from "react"
import { TwitterLogo, YoutubeLogo } from "@phosphor-icons/react"

export type CustomEmbedConfig = {
  type: "tweet" | "youtube-video"
  contentName: string
  keywords: string[]
  icon: React.JSX.Element
}

export const EmbedConfigs: CustomEmbedConfig[] = [
  {
    type: "tweet",
    contentName: "Tweet",
    keywords: ["tweet", "x", "twitter", "post"],
    icon: <TwitterLogo className="size-4" />,
  },
  {
    type: "youtube-video",
    contentName: "YouTube Video",
    keywords: ["youtube", "video", "embed", "player"],
    icon: <YoutubeLogo className="size-4" />,
  },
]
