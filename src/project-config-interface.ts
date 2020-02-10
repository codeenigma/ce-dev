export default interface ProjectConfig {
  'project_name': string,
  'registry': string,
  'ansible_paths': Record<string, string>
}
