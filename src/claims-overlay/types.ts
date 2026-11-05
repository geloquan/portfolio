export type ClaimStatus = 'needs_explanation' | 'draft' | 'explained'

export type ClaimExplanation = {
  meaning: string
  basis?: string
  context?: string
  fine_print?: string
}

export type ClaimOccurrence = {
  file: string
  selector: string
}

export type ClaimEntry = {
  text: string
  type: 'performance' | 'savings' | 'accuracy' | 'reliability' | 'social_proof' | 'ranking' | 'credential' | 'compliance' | 'comparison'
  status: ClaimStatus
  explanation?: ClaimExplanation | null
  open_questions: string[]
  occurrences: ClaimOccurrence[]
}

export type ClaimsDictionary = {
  version: 1
  claims: Record<string, ClaimEntry>
}
