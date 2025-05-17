
import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ScriptEditorProps {
  initialContent?: string
  onSave?: (content: string) => void
}

export function ScriptEditor({ initialContent = "", onSave }: ScriptEditorProps) {
  const [content, setContent] = React.useState(initialContent)
  const [isGenerating, setIsGenerating] = React.useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    // Mock script generation
    setTimeout(() => {
      const generatedScript = "This is an AI-generated script about the selected topic. It includes an engaging introduction, three main points with supporting information, and a strong call-to-action conclusion. The script is optimized for short-form video content and should be approximately 30-60 seconds when read aloud."
      setContent(generatedScript)
      setIsGenerating(false)
    }, 1500)
  }

  const handleSave = () => {
    onSave?.(content)
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Script</h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          <RefreshCw className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Regenerate"}
        </Button>
      </div>
      <Textarea
        className="min-h-[200px] mb-4"
        placeholder="Enter your script here or generate one using AI..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Script</Button>
      </div>
    </div>
  )
}
