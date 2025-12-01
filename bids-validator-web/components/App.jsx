import React from 'react'
import Issues from '../components/Issues'
import Validate from '../components/Validate'
import validate from '../../bids-validator'
import validatorPackageJson from 'bids-validator/package.json' assert { type: 'json' }
const version = validatorPackageJson.version

// component setup -----------------------------------------------------------
const initState = () => ({
  dirName: '',
  list: {},
  nameError: null,
  projectId: '',
  refs: {},
  errors: [],
  warnings: [],
  summary: null,
  status: '',
  uploadStatus: '',
  options: {
    ignoreWarnings: false,
    ignoreNiftiHeaders: false,
    ignoreSubjectConsistency: false,
  },
})

export default class App extends React.Component {
  constructor() {
    super()
    this.state = initState()
    this.validate = this._validate.bind(this)
    this.reset = this._reset.bind(this)
  }

  _validate(selectedFiles) {
    const dirName = selectedFiles.list[0].webkitRelativePath.split('/')[0]
    const defaultConfig = `${dirName}/.bids-validator-config.json`
    this.setState({
      status: 'validating',
      showIssues: true,
      activeKey: 3,
      dirName,
    })
    return validate.BIDS(
      selectedFiles.list,
      {
        verbose: true,
        ...this.state.options,
        config: defaultConfig,
      },
      (issues, summary) => {
        if (issues === 'Invalid') {
          return this.setState({
            errors: 'Invalid',
            summary,
            status: 'validated',
          })
        } else {
          return this.setState({
            errors: issues.errors ? issues.errors : [],
            warnings: issues.warnings ? issues.warnings : [],
            summary,
            status: 'validated',
          })
        }
      },
    )
  }

  _reset() {
    this.setState(initState())
  }

  handleOptionToggle = (e) => {
    const { name } = e.target
    this.setState((prevState) => ({
      ...prevState,
      options: {
        ...prevState.options,
        [name]: !prevState.options[name],
      },
    }))
  }

  render() {
    return (
      <div id="root">
        <nav className="navbar navbar-dark bg-dark fixed-top">
          <div className="container">
            <div className="navbar-header">
              <a
                className="navbar-brand"
                href="https://www.npmjs.com/package/bids-validator"
                target="_blank">
                BIDS Validator v{version}
              </a>
            </div>
          </div>
        </nav>
        <div className="container page-wrapper">
          <div className="banner">
            <strong>Notice:</strong> This version of the BIDS Validator is no
            longer being developed. It is provided for historical reference
            only.
            <br />
            Please visit{' '}
            <a href="https://bids-standard.github.io/bids-validator/">
              https://bids-standard.github.io/bids-validator/
            </a>{' '}
            for the latest version.
          </div>
          <div className="validator">
            <Validate
              loading={this.state.status === 'validating'}
              options={this.state.options}
              onChange={this.validate}
              handleOptionToggle={this.handleOptionToggle}
            />
          </div>
          {this.state.status === 'validated' ? (
            <Issues reset={this.reset} {...this.state} />
          ) : null}
        </div>
      </div>
    )
  }
}
