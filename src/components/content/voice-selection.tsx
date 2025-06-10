
import * as React from "react"
import { VoiceCard } from "@/components/ui/voice-card"

// Mock voice data
const voices = [
  {
    id: 1,
    name: "Sophie",
    language: "English (US)",
    gender: "Female",
    preview: ""
  },
  {
    id: 2,
    name: "James",
    language: "English (UK)",
    gender: "Male",
    preview: ""
  },
  {
    id: 3,
    name: "Ana",
    language: "Spanish",
    gender: "Female",
    preview: ""
  },
  {
    id: 4,
    name: "David",
    language: "French",
    gender: "Male",
    preview: ""
  },
  {
    id: 5,
    name: "Yuki",
    language: "Japanese",
    gender: "Female",
    preview: ""
  },
  {
    id: 6,
    name: "Chen",
    language: "Chinese",
    gender: "Male",
    preview: ""
  }
]

interface VoiceSelectionProps {
  onSelectVoice?: (voiceId: number) => void
}

export function VoiceSelection({ onSelectVoice }: VoiceSelectionProps) {
  const [selectedVoice, setSelectedVoice] = React.useState<number | null>(null)

  const handleSelect = (id: number) => {
    setSelectedVoice(id)
    onSelectVoice?.(id)
  }

  const handlePlay = (id: number) => {
    console.log("Playing voice preview for", id)
    // Implement voice preview logic
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Choose a Voice</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {voices.map((voice) => (
          <VoiceCard
            key={voice.id}
            name={voice.name}
            language={voice.language}
            gender={voice.gender}
            isSelected={selectedVoice === voice.id}
            onSelect={() => handleSelect(voice.id)}
            onPlay={() => handlePlay(voice.id)}
          />
        ))}
      </div>
    </div>
  )
}
