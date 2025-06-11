import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download } from "lucide-react";

interface VideoCreatorProps {
  downloadProgress: number;
  handleBack: () => void;
  handleDownload: () => void;
  videoUrl?: string;
}

export function VideoCreator({
  downloadProgress,
  handleBack,
  handleDownload,
  videoUrl,
}: VideoCreatorProps) {
  const handleDownloadVideo = () => {
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = `video_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      handleDownload(); // Trigger progress animation
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Creation</CardTitle>
        <CardDescription>Your video has been generated</CardDescription>
      </CardHeader>
      <CardContent>
        {videoUrl ? (
          <div className="space-y-4">
            <video controls className="w-full max-w-lg mx-auto rounded">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {downloadProgress > 0 && downloadProgress < 100 && (
              <div>
                <p>Preparing download...</p>
                <Progress value={downloadProgress} className="w-full" />
              </div>
            )}
          </div>
        ) : (
          <p>Video is being generated...</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {videoUrl && (
          <Button onClick={handleDownloadVideo} disabled={downloadProgress > 0 && downloadProgress < 100}>
            <Download className="mr-2 h-4 w-4" /> {downloadProgress === 0 ? "Download Video" : "Preparing..."}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}