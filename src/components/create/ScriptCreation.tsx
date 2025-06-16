
import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScriptEditor } from "@/components/content/script-editor"
import { ArrowLeft } from "lucide-react"

export type ScriptCreationArgs = {
  keyword: string;
  style: string;
  language: string;
  wordCount: number;
}
interface ScriptCreationProps {
  script: string;
  handleBack: () => void;
  handleSaveScript: (content: string) => void;
  args: ScriptCreationArgs;
}

export function ScriptCreation({
  script,
  handleBack,
  handleSaveScript,
  args
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
        <ScriptEditor 
          initialContent={script} 
          onSave={handleSaveScript}
          args={args}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </CardFooter>
    </Card>
  );
}
