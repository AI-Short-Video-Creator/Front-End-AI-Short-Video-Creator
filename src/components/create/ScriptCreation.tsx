
import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScriptEditor } from "@/components/content/script-editor"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { PersonalStyle } from "@/hooks/data/useScript"
interface ScriptCreationProps {
  imageUrls: string[];
  script: string;
  handleBack: () => void;
  handleSaveScript: (content: string) => void;
  keyword?: string;
  personalStyle?: PersonalStyle;
  canRegenerate?: boolean;
  handleNextStep?: () => void;
}

export function ScriptCreation({
  imageUrls,
  script,
  handleBack,
  handleSaveScript,
  keyword,
  personalStyle,
  canRegenerate = true,
  handleNextStep,
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
          args={{
            keyword,
            personalStyle,
          }}
          canRegenerate={canRegenerate}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex item-center justify-between w-full">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {
            imageUrls.length > 0 && (
              <Button
                onClick={handleNextStep}
                variant="outline"
                disabled={!imageUrls.length}
                className="gap-2"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )
          }
        </div>
      </CardFooter>
    </Card>
  );
}
