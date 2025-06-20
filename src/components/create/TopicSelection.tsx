import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { LoadingSpinner } from "../Loading"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import LanguageList from "language-list"
import useSuggestion from "@/hooks/data/useSuggestion"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { PersonalStyle } from "@/hooks/data/useScript"

interface TopicSelectionProps {
  keyword: string;
  setKeyword: (keyword: string) => void;
  handleKeywordSelect: (keyword: string) => void;
  handleGenerateScript: () => void;
  isGenerating: boolean;
  personalStyle: PersonalStyle;
  handleChange: (field: string, value: any) => void;
  handleImportScript?: (file: File) => void;
}

export function TopicSelection({
  keyword,
  setKeyword,
  handleKeywordSelect,
  handleGenerateScript,
  isGenerating,
  personalStyle,
  handleChange,
  handleImportScript
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
  const [source, setSource] = React.useState("youtube");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);

  const debouncedKeyword = useDebouncedValue(keyword, 300);
  const { suggestions } = useSuggestion(debouncedKeyword, 5, source);

  const getFileIcon = (file: File) => {
    if (file.name.endsWith('.docx')) {
      return (
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="mx-auto mb-2 text-blue-600">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#2563eb"/>
          <text x="12" y="16" fontSize="7" fill="#fff" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">DOCX</text>
        </svg>
      );
    } else if (file.name.endsWith('.txt')) {
      return (
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="mx-auto mb-2 text-gray-500">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#6b7280"/>
          <text x="12" y="16" fontSize="7" fill="#fff" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">TXT</text>
        </svg>
      );
    } else {
      return null;
    }
  };

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
          {/* Source selection with Select */}
          <div>
            <label className="block mb-1 text-sm font-medium">Choose Source:</label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-red-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.228 3.5 12 3.5 12 3.5s-7.228 0-9.391.569A2.994 2.994 0 0 0 .502 6.186C0 8.36 0 12 0 12s0 3.64.502 5.814a2.994 2.994 0 0 0 2.107 2.117C4.772 20.5 12 20.5 12 20.5s7.228 0 9.391-.569a2.994 2.994 0 0 0 2.107-2.117C24 15.64 24 12 24 12s0-3.64-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></span>
                    YouTube
                  </span>
                </SelectItem>
                <SelectItem value="wiki">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-blue-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm.001 18c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8 4.418 0 8 3.582 8 8 0 4.418-3.582 8-8 8zm.001-14c-3.313 0-6 2.687-6 6 0 3.313 2.687 6 6 6 3.313 0 6-2.687 6-6 0-3.313-2.687-6-6-6zm0 10c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4 2.209 0 4 1.791 4 4 0 2.209-1.791 4-4 4z"/></svg></span>
                    Wikipedia
                  </span>
                </SelectItem>
                <SelectItem value="google">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-sky-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-2.12 2.12 3.75 3.75 2.29-2.29z"/></svg></span>
                    Google Trends
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Keyword input with suggestions */}
          <div className="relative">
            <Input
              placeholder="Enter a keyword (e.g., AI in everyday life, Sustainability tips)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="text-base"
              onFocus={() => keyword && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && suggestions?.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 max-h-48 overflow-y-auto">
                {suggestions?.map((s: string, idx: number) => (
                  <div
                    key={s}
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-5 py-1.5 text-sm outline-none transition-colors text-foreground hover:bg-accent hover:text-accent-foreground data-[state=selected]:bg-primary data-[state=selected]:text-primary-foreground"
                    onMouseDown={() => {
                      setKeyword(s);
                      setShowSuggestions(false);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {["AI", "Tech", "Fashion", "Health", "Finance", "Education"].map((tag) => (
              <Badge 
                key={tag}
                variant={keyword === tag ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleKeywordSelect(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Content Style</label>
            <Select value={personalStyle.style} onValueChange={(value) => handleChange("style", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="informative">Informative</SelectItem>
                <SelectItem value="entertaining">Entertaining</SelectItem>
                <SelectItem value="inspirational">Inspirational</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="storytelling">Storytelling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Language</label>
            <Select value={personalStyle.language} onValueChange={(value) => handleChange("language", value)}>
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
              value={personalStyle.wordCount}
              onChange={e => handleChange("wordCount", Number(e.target.value))}
              className="text-base"
              placeholder="Enter word count (e.g., 100)"
            />
          </div>
          {/* Personal Style Fields */}
          <div>
            <label className="block mb-1 text-sm font-medium">Tone</label>
            <Select value={personalStyle.tone} onValueChange={(value) => handleChange("tone", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
                <SelectItem value="dramatic">Dramatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Perspective</label>
            <Select value={personalStyle.perspective} onValueChange={(value) => handleChange("perspective", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select perspective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">First Person (I/We)</SelectItem>
                <SelectItem value="second">Second Person (You)</SelectItem>
                <SelectItem value="third">Third Person (He/She/They)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Humor</label>
            <Select value={personalStyle.humor} onValueChange={(value) => handleChange("humor", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select humor level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Use of Quotes</label>
            <Select value={personalStyle.quotes} onValueChange={(value) => handleChange("quotes", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="sometimes">Sometimes</SelectItem>
                <SelectItem value="often">Often</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Upload Existing Script</label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center relative group hover:border-primary transition-colors min-h-[120px] mb-4">
              {uploadedFile ? (
                <>
                  {getFileIcon(uploadedFile)}
                  <div className="text-gray-700 text-sm font-medium mb-2">{uploadedFile.name}</div>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-sm gap-2"
                    onClick={() => handleImportScript && handleImportScript(uploadedFile)}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    Import
                  </button>
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    onClick={() => setUploadedFile(null)}
                    title="Remove file"
                  >
                    &times;
                  </button>
                </>
              ) : (
                <>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto mb-2 text-gray-400 group-hover:text-primary transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  <input
                    type="file"
                    accept=".docx,.txt"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFile(file);
                      }
                    }}
                  />
                  <div className="text-gray-500 text-sm">
                    Click to upload or drag and drop <b>.docx</b>, <b>.txt</b> file
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Max size: 5 MB</div>
                </>
              )}
            </div>
          </div>
          <Button 
            className="w-full gap-2"
            onClick={handleGenerateScript}
            disabled={!keyword.trim() || isGenerating}
          >
            {isGenerating ? <LoadingSpinner /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "" : "Generate Script"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
