export type ClaimStatus = 'needs_explanation' | 'draft' | 'explained'

export type ClaimExplanation = {
  meaning: string
  basis?: string
  context?: string
  fine_print?: string
}

export type ClaimEntry = {
  text: string
  type: string
  status: ClaimStatus
  explanation: ClaimExplanation | null
  open_questions: string[]
  occurrences: string[]
}

export type ClaimsDictionary = Record<string, ClaimEntry>
