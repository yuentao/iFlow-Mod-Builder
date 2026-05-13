export interface ModConfig {
  id: string
  name: string
  version: string
  type: 'append' | 'prepend' | 'replace' | 'patch'
  description?: string
  author?: string
  category?: string
  iflowVersion?: string
  iflowVersionConstraint?: string
  icon?: string
  tags?: string[]
  homepage?: string
  repository?: string
  license?: string
  entry?: string
}

export interface ModWorkspace {
  codePath: string
  codeContent: string
  workDir: string
  modJson: Partial<ModConfig>
  createdAt: string
}