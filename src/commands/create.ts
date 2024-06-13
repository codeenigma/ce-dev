import { Flags, ux } from '@oclif/core'
import inquirer from 'inquirer'
import {execSync} from 'node:child_process'
import fs from 'node:fs'
import fspath from "node:path";

import BaseCmd from '../abstracts/base-cmd-abstract.js'

export default class CreateCmd extends BaseCmd {
  static description = 'Generates a new project from a template'

  static examples = [
    '$ ce-dev create --template drupal8 --project myproject',
  ]

  static flags = {
    destination: Flags.string({
      char: 'd',
      description: 'Path to the project destination.',
    }),
    help: Flags.help({char: 'h'}),
    project: Flags.string({
      char: 'p',
      description: 'A unique name for your project. Because it is used in various places (db names, url, etc), stick with lowercase alphanumeric chars.',
    }),
    template: Flags.string({
      char: 't',
      description: 'Name of a template: "drupal8"',
    }),
  }

  /**
   * @member
   * Destination for the new project.
   */
  private projectDestination = ''

  /**
   * @member
   * Project name.
   */
  private projectName = ''

  /**
   * @member
   * Template name.
   */
  private templateName = ''

  /**
   * @member
   * Template dir.
   */
  private readonly templatesDir: string = fspath.join(this.config.root, 'templates')

  /**
   * @inheritdoc
   */
  async run(): Promise<void> {
    const {flags} = await this.parse(CreateCmd)
    let {project} = flags
    if (!project) {
      const response = await inquirer.prompt([{
        message: 'Name for the project',
        name: 'project',
        type: 'input',
      }])
      project = response.project
    }

    this.projectName = project as string
    let {template} = flags
    // @todo make list dynamic.
    if (!template) {
      const response = await inquirer.prompt([{
        choices: [
          'drupal10',
          'localgov',
          'blank',
        ],
        message: 'Template',
        name: 'template',
        type: 'list',
      }])
      template = response.template
    }

    this.templateName = template as string
    let {destination} = flags
    if (!destination) {
      const response = await inquirer.prompt([{
        default: fspath.resolve(process.cwd() + '/' + project),
        message: 'Path for the project',
        name: 'destination',
        type: 'input',
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

  private copyProject(): void {
    fs.renameSync(fspath.join(this.config.cacheDir, this.projectName), this.projectDestination)
  }

  private copyTemplates(): void {
    execSync(this.dockerBin + ' cp ' + this.templatesDir + ' ce_dev_controller:/home/ce-dev/')
  }

  private play(): void {
    const vars = '\'{"project_name":"' + this.projectName + '","project_type":"' + this.templateName + '"}\''
    execSync(this.dockerBin + ' exec -t --user ce-dev ce_dev_controller /home/ce-dev/ansible/bin/ansible-playbook /home/ce-dev/templates/create.yml --extra-vars=' + vars)
  }
}
