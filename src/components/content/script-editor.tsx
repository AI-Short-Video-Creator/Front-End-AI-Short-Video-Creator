import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import useScript from "@/hooks/data/useScript"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "../Loading"

interface ScriptEditorProps {
  initialContent?: string
  onSave?: (content: string) => void
  topic: string
  keywords: string[]
}

export function ScriptEditor({ initialContent = "", onSave, topic, keywords }: ScriptEditorProps) {
  const [content, setContent] = React.useState(initialContent)
  const { createScriptAsync, isCreatingScript } = useScript()
  const { toast } = useToast()

  const handleGenerate = async () => {
    const script = await createScriptAsync({
      topic,
      keywords,
    })

    if (script.data) {
      setContent(script.data)
    } else {
      toast({
        title: "Error",
        description: "Failed to generate script.",
        variant: "destructive",
      })
    }
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
          disabled={isCreatingScript}
        >
          <RefreshCw className="h-4 w-4" />
          {isCreatingScript ? <LoadingSpinner/> : "Regenerate"}
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
