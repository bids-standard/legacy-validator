// dependencies -------------------------------------------------------

import React from 'react'
import PropTypes from 'prop-types'
import pluralize from 'pluralize'
import Results from './results/Results'
import Spinner from './Spinner.jsx'
import ErrorLink from './ErrorLink.jsx'
import Summary from '../components/Summary'

class Issues extends React.Component {
  constructor(props) {
    super(props)
    this._reset = this.props.reset.bind(this)
  }
  // life cycle events --------------------------------------------------

  render() {
    // short references
    let errors = this.props.errors
    let warnings = this.props.warnings
    let dirName = this.props.dirName

    // counts
    let totalErrors = 0
    let totalWarnings = 0
    let warningCount, errorCount
    if (errors !== 'Invalid') {
      totalErrors = errors.length
      totalWarnings = warnings.length
      warningCount = totalWarnings + ' ' + pluralize('Warning', totalWarnings)
      errorCount = totalErrors + ' ' + pluralize('Error', totalErrors)
    }
    // messages
    let specLink = (
      <h5>
        Click to view details on{' '}
        <a
          href="https://bids-specification.readthedocs.io/en/stable/"
          target="_blank">
          BIDS specification
        </a>
      </h5>
    )
    let notBIDSMessage = (
      <h4>
        This directory failed an initial Quick Test. This means the basic names
        and structure of the files and directories do not comply with BIDS
        specification. <span onClick={this._reset}>Select a new folder</span>{' '}
        and try again.
      </h4>
    )
    let warningsMessage = <h4>We found {warningCount} in your dataset.</h4>
    let errorMessage = <h4>Your dataset is not a valid BIDS dataset.</h4>
    let noErrorMessage = <h4>This is a valid BIDS dataset!</h4>
    let neurostarsLink = (
      <h5>
        If you have any questions please post on{' '}
        <a href="https://neurostars.org/tags/bids" target="_blank">
          Neurostars
        </a>
      </h5>
    )
    let sourcecode = (
      <h5>
        The source code for the validator can be found{' '}
        <a
          href="https://github.com/bids-standard/bids-validator"
          target="_blank">
          here
        </a>
      </h5>
    )

    // determine message
    let message
    if (errors === 'Invalid') {
      message = notBIDSMessage
    } else if (errors.length > 0) {
      message = errorMessage
    } else if (warnings.length > 0) {
      message = warningsMessage
    } else {
      message = noErrorMessage
    }

    // loading animation
    let loading = (
      <Spinner text="validating" active={this.props.status === 'validating'} />
    )

    // results
    let results = (
      <div className="card card-header container issues my-3">
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={this._reset}>
          <span aria-hidden="true">&times;</span>
        </button>
        <Summary summary={this.props.summary} dirName={this.props.dirName} />
        {message}
        {errors !== 'Invalid' ? (
          <Results errors={errors} warnings={warnings} />
        ) : null}
        {(errors.length > 0 && errors !== 'Invalid') || warnings.length > 0 ? (
          <ErrorLink dirName={dirName} errors={errors} warnings={warnings} />
        ) : null}
        {specLink}
        {neurostarsLink}
        {sourcecode}
      </div>
    )

    return <div>{this.props.status === 'validating' ? loading : results}</div>
  }
}

Issues.propTypes = {
  reset: PropTypes.func,
  errors: PropTypes.array,
  warnings: PropTypes.array,
  dirName: PropTypes.string,
  status: PropTypes.string,
}

Issues.defaultProps = {
  reset: () => {},
  errors: [],
  warnings: [],
  dirName: '',
  status: '',
}

export default Issues
