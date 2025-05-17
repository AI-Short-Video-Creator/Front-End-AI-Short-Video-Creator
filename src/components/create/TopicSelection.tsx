
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

interface TopicSelectionProps {
  topic: string;
  setTopic: (topic: string) => void;
  selectedKeywords: string[];
  handleKeywordSelect: (keyword: string) => void;
  handleGenerateScript: () => void;
}

export function TopicSelection({
  topic,
  setTopic,
  selectedKeywords,
  handleKeywordSelect,
  handleGenerateScript
}: TopicSelectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Topic</CardTitle>
        <CardDescription>
          Enter a topic or keyword for your short video
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Enter a topic (e.g., AI in everyday life, Sustainability tips)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["AI", "Tech", "Fashion", "Health", "Finance", "Education"].map((tag) => (
              <Badge 
                key={tag}
                variant={selectedKeywords.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleKeywordSelect(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Button 
            className="w-full gap-2"
            onClick={handleGenerateScript}
            disabled={!topic.trim() && selectedKeywords.length === 0}
          >
            <Sparkles className="h-4 w-4" />
            Generate Script from Topic
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
