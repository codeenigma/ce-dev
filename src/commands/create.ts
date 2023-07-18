import * as inquirer from 'inquirer'

import BaseCmd from '../base-cmd-abstract'
import {execSync} from 'child_process'
import {flags} from '@oclif/command'
import ux from 'cli-ux'

const fs = require('fs')
const fspath = require('path')

export default class CreateCmd extends BaseCmd {
  static description = 'Generates a new project from a template'

  static examples = [
    '$ ce-dev create --template drupal8 --project myproject',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    template: flags.string({
      char: 't',
      description: 'Name of a template: "drupal8"',
    }),
    project: flags.string({
      char: 'p',
      description: 'A unique name for your project. Because it is used in various places (db names, url, etc), stick with lowercase alphanumeric chars.',
    }),
    destination: flags.string({
      char: 'd',
      description: 'Path to the project destination.',
    }),
  }

  /**
   * @member
   * Template dir.
   */
  private readonly templatesDir: string = fspath.join(this.config.root, 'templates')

  /**
   * @member
   * Template name.
   */
  private templateName = ''

  /**
   * @member
   * Project name.
   */
  private projectName = ''

  /**
   * @member
   * Destination for the new project.
   */
  private projectDestination = ''

  /**
   * @inheritdoc
   */
  async run(): Promise<any> {
    const {flags} = this.parse(CreateCmd)
    let project = flags.project
    if (!project) {
      const response: any = await inquirer.prompt([{
        name: 'project',
        message: 'Name for the project',
        type: 'input',
      }])
      project = response.project
    }
    this.projectName = project as string
    let template = flags.template
    // @todo make list dynamic.
    if (!template) {
      const response: any = await inquirer.prompt([{
        name: 'template',
        message: 'Template',
        type: 'list',
        choices: [
          'drupal8',
          'drupal9',
          'localgov',
          'blank',
        ],
      }])
      template = response.template
    }
    this.templateName = template as string
    let destination = flags.destination
    if (!destination) {
      const response: any = await inquirer.prompt([{
        name: 'destination',
        message: 'Path for the project',
        type: 'input',
        default: fspath.resolve(process.cwd() + '/' + project),
      }])
      destination = response.destination
    }
    this.projectDestination = destination as string
    ux.action.start('Generating project from template')
    this.copyTemplates()
    this.play()
    this.copyProject()
    ux.action.stop('Project ' + this.projectName + ' created at ' + this.projectDestination)
  }

  private copyTemplates(): void {
    execSync(this.dockerBin + ' cp ' + this.templatesDir + ' ce_dev_controller:/home/ce-dev/')
  }

  private play(): void {
    const vars = '\'{"project_name":"' + this.projectName + '","project_type":"' + this.templateName + '"}\''
    execSync(this.dockerBin + ' exec -t --user ce-dev ce_dev_controller ansible-playbook /home/ce-dev/templates/create.yml --extra-vars=' + vars)
  }

  private copyProject(): void {
    fs.renameSync(fspath.join(this.config.cacheDir, this.projectName), this.projectDestination)
  }
}
