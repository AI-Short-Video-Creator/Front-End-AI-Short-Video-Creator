
import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScriptEditor } from "@/components/content/script-editor"
import { ArrowLeft } from "lucide-react"

interface ScriptCreationProps {
    downloadProgress: number,
    handleBack : () => void,
    handleDownload: (content: string) => void,
}

export function VideoCreator({
    downloadProgress,
    handleBack,
    handleDownload
}: ScriptCreationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Script</CardTitle>
        <CardDescription>
          Customize the AI-generated script or write your own
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* <ScriptEditor 
          initialContent={script} 
          onSave={handleSaveScript}
          topic={topic}
          keywords={keywords}
        /> */}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </CardFooter>
    </Card>
  );
}

