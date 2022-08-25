// dependencies -----------------------------------------------------------

import React from 'react'
import PropTypes from 'prop-types'
import { Card, Collapse } from 'react-bootstrap'
import pluralize from 'pluralize'
import Issue from './Issue'

// component setup --------------------------------------------------------

class Issues extends React.Component {
  constructor() {
    super()
    this.state = {
      showMore: [],
      errorOpen: false,
    }
  }

  // life cycle events ------------------------------------------------------

  render() {
    let self = this
    let issueFiles = this.props.issues
    let issues = issueFiles.map((issue, index) => {
      let files = issue.files
      if (this.state.showMore.indexOf(index) === -1) {
        files = issue.files.slice(0, 10)
      }

      // issue sub-errors
      let hasErrorFiles = false
      let subErrors = files.map(function (error, index2) {
        if (error && error.file) {
          hasErrorFiles = true
          return (
            <Issue
              type={self.props.issueType}
              error={error}
              index={index2}
              key={index2}
            />
          )
        }
      })

      // issue card
      if (hasErrorFiles) {
        return (
          <Card className="validation-error fadeIn" key={index}>
            <Card.Header
              className="error-header"
              aria-expanded={this.state.errorOpen}
              aria-controls={'error_' + index}
              onClick={() =>
                this.setState({ errorOpen: !this.state.errorOpen })
              }>
              {this._header(issue, index, this.props.issueType, hasErrorFiles)}
            </Card.Header>
            <Collapse in={this.state.errorOpen}>
              <Card.Body id={'error_' + index}>
                {subErrors}
                {this._viewMore(issue.files, index)}
              </Card.Body>
            </Collapse>
          </Card>
        )
      } else {
        return (
          <div className="panel panel-default" key={index}>
            <div className="panel-heading">
              {this._header(issue, index, this.props.issueType, hasErrorFiles)}
            </div>
          </div>
        )
      }
    })
    return <div>{issues}</div>
  }

  // template methods -------------------------------------------------------

  _header(issue, index, type, hasErrorFiles) {
    let issueCount = pluralize('files', issue.files.length)
    let fileCount
    if (hasErrorFiles) {
      fileCount = (
        <span className="pull-right">
          {issue.files.length} {issueCount}
        </span>
      )
    }
    return (
      <span className="panel-title file-header">
        <h4 className="em-header clearfix">
          <strong className="em-header pull-left">
            {type} {index + 1}: [Code {issue.code}] {issue.key}
          </strong>
        </h4>
        {this._issueLink(issue)}
        {issue.reason}
        {fileCount}
      </span>
    )
  }

  _issueLink(issue) {
    if (issue && issue.helpUrl) {
      return (
        <p>
          <a target="_blank" href={issue.helpUrl}>
            Click here for more information about this issue
          </a>
        </p>
      )
    } else {
      return null
    }
  }

  _viewMore(files, index) {
    if (this.state.showMore.indexOf(index) === -1 && files.length > 10) {
      return (
        <div
          className="issues-view-more"
          onClick={this._showMore.bind(this, index)}>
          <button>View {files.length - 10} more files</button>
        </div>
      )
    }
  }

  // custom methods ---------------------------------------------------------

  _showMore(index) {
    let showMore = this.state.showMore
    showMore.push(index)
    this.setState({ showMore })
  }
}

Issues.propTypes = {
  issues: PropTypes.array.isRequired,
  issueType: PropTypes.string.isRequired,
}

export default Issues
