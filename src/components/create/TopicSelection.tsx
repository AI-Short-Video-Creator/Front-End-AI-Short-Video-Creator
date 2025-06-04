import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { LoadingSpinner } from "../Loading"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import LanguageList from "language-list"

interface TopicSelectionProps {
  topic: string;
  setTopic: (topic: string) => void;
  selectedKeywords: string[];
  handleKeywordSelect: (keyword: string) => void;
  handleGenerateScript: () => void;
  isGenerating: boolean;
  contentStyle: string;
  setContentStyle: (style: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  wordCount: number;
  setWordCount: (count: number) => void;
}

export function TopicSelection({
  topic,
  setTopic,
  selectedKeywords,
  handleKeywordSelect,
  handleGenerateScript,
  isGenerating,
  contentStyle,
  setContentStyle,
  language,
  setLanguage,
  wordCount,
  setWordCount
}: TopicSelectionProps) {
  const languages = React.useMemo(() => new LanguageList().getData(), [])
  const [searchTerm, setSearchTerm] = React.useState("")
  const filteredLanguages = React.useMemo(
    () =>
      languages.filter(lang =>
        lang.language.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [languages, searchTerm]
  )
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
          <div>
            <label className="block mb-1 text-sm font-medium">Content Style</label>
            <Select value={contentStyle} onValueChange={setContentStyle}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Informative">Informative</SelectItem>
                <SelectItem value="Entertaining">Entertaining</SelectItem>
                <SelectItem value="Inspirational">Inspirational</SelectItem>
                <SelectItem value="Educational">Educational</SelectItem>
                <SelectItem value="Storytelling">Storytelling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2 sticky top-0 z-10">
                  <Input
                    placeholder="Search language..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {filteredLanguages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.language}</SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Word Count</label>
            <Input
              type="number"
              min={30}
              max={500}
              value={wordCount}
              onChange={e => setWordCount(Number(e.target.value))}
              className="text-base"
              placeholder="Enter word count (e.g., 100)"
            />
          </div>
          <Button 
            className="w-full gap-2"
            onClick={handleGenerateScript}
            disabled={!topic.trim() && selectedKeywords.length === 0}
          >
            {isGenerating ? <LoadingSpinner/> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "" : "Generate Script"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
