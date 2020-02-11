
import {execSync} from 'child_process'
const fspath = require('path')
import AnsibleCmd from '../base-cmd-ansible-abstract'

export default class DeployCmd extends AnsibleCmd {
  static description = 'Setup an app with Ansible playbooks.'
  static examples = [
    '$ ce-dev deploy example-app',
  ]
  /**
   * Provision a single container.
   * @param containerName
   * Name of the container to target.
   */
  protected playContainer(containerName: string) {
    let ansiblePath = this.activeProjectInfo.provision[containerName]
    let src = fspath.dirname(ansiblePath)
    let dest = '/home/ce-dev/projects-playbooks/deploy' + fspath.dirname(src)
    this.log('Copy Ansible configuration')
    execSync(this.dockerBin + ' exec -t --user ce-dev ce_dev_controller mkdir -p ' + dest)
    execSync(this.dockerBin + ' cp ' + src + ' ce_dev_controller:' + dest)
    execSync(this.dockerBin + ' exec -t --user ce-dev ce_dev_controller ansible-playbook /home/ce-dev/projects-playbooks/deploy' + ansiblePath + ' --extra-vars \'{"is_local":"yes","ansible_deploy_dir":"/home/ce-dev/ansible-deploy"}\'', {stdio: 'inherit'})
  }

  /**
   * Gather project's containers that define an ansible path.
   */
  protected getProjectRunningContainersAnsible(): Array<string> {
    const running: Array<string> = this.getProjectRunningContainers()
    const ansible: Array<string> = []
    running.forEach(containerName => {
      if (this.activeProjectInfo.deploy.hasOwnProperty(containerName)) {
        ansible.push(containerName)
      }
    })
    return ansible
  }
}
