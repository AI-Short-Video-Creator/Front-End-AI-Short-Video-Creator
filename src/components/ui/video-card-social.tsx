import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Trash2, MoreHorizontal, Share2, Download, Facebook, Youtube, Music } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface VideoCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    thumbnail?: string
    date?: string
    sharedOn?: {
        facebook?: boolean;
        youtube?: boolean;
        tiktok?: boolean;
    };
    link?: {
        facebook?: string;
        youtube?: string;
        tiktok?: string;
    };
    onPlay?: () => void
    onDelete?: () => void
    onShare?: () => void
    onAnalytics?: () => void
    onDownload?: () => void
    videoUrl?: string
}

export function VideoCard({
    title,
    thumbnail,
    date,
    onPlay,
    onDelete,
    onShare,
    onAnalytics,
    onDownload,
    sharedOn,
    link,
    videoUrl,
    className,
    ...props
}: VideoCardProps) {
    return (
        <Card
            className={cn(
                "border border-border/40 bg-white shadow-sm overflow-hidden",
                className
            )}
            {...props}
        >
            <div className="relative video-container-social bg-gray-100">
                {videoUrl ? (
                    <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-cover rounded"
                        poster={thumbnail}
                        style={{ aspectRatio: "16/9", minHeight: 120 }}
                    />
                ) : (
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover rounded"
                        style={{ aspectRatio: "16/9", minHeight: 120 }}
                    />
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 z-10 rounded-full bg-black/30 hover:bg-black/50">
                            <MoreHorizontal size={16} className="text-white" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onShare}>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <CardContent className="p-3">
                <h3 className="font-medium text-sm truncate mb-1 text-black dark:text-white">{title}</h3>
                {date && <p className="text-xs text-muted-foreground">{date}</p>}
                {sharedOn && Object.values(sharedOn).some(v => v) && (
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Shared on:</span>
                        <div className="flex items-center gap-1.5">
                            {sharedOn.facebook && link?.facebook && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => window.open(link.facebook, "_blank")}
                                            className="p-0 bg-transparent border-none flex items-center gap-1"
                                            aria-label="Open Facebook"
                                        >
                                            <img
                                                src="/logos/facebook.png"
                                                alt="Facebook"
                                                className="h-4 w-4"
                                            />
                                            <img
                                                src="/logos/insert_link.png"
                                                alt="Link"
                                                className="h-4 w-4"
                                            />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Facebook</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {sharedOn.youtube && link?.youtube && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => window.open(link.youtube, "_blank")}
                                            className="p-0 bg-transparent border-none flex items-center gap-1"
                                            aria-label="Open YouTube"
                                        >
                                            <img
                                                src="/logos/youtube.png"
                                                alt="YouTube"
                                                className="h-4 w-4"
                                            />
                                            <img
                                                src="/logos/insert_link.png"
                                                alt="Link"
                                                className="h-4 w-4"
                                            />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>YouTube</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {sharedOn.tiktok && link?.tiktok && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => window.open(link.tiktok, "_blank")}
                                            className="p-0 bg-transparent border-none flex items-center gap-1"
                                            aria-label="Open TikTok"
                                        >
                                            <img
                                                src="/logos/tiktok.png"
                                                alt="TikTok"
                                                className="h-4 w-4 inline-flex items-center justify-center h-5 w-5 rounded bg-white"
                                            />
                                            <img
                                                src="/logos/insert_link.png"
                                                alt="Link"
                                                className="h-4 w-4"
                                            />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>TikTok</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
