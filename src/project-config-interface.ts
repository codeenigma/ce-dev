export default interface ProjectConfig {
  'project_name': string,
  'registry': string,
  'provision': Record<string, string>
  'deploy': Record<string, string>
}
