import React from 'react'
import Upload from './Upload.jsx'
import Spinner from './Spinner.jsx'
import Options from './Options.jsx'

class Validate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }

    this._clearInput = this.props.reset
    this._onChange = this.props.onChange
    this._setRefs = this.props.setRefs
  }

  // life cycle events --------------------------------------------------

  render() {
    let { options, handleOptionToggle } = this.props
    let loading = <Spinner text="validating" active={true} />

    let select = (
      <div className="card-header">
        <h3>
          Select a{' '}
          <a href="https://bids.neuroimaging.io" target="_blank">
            BIDS dataset
          </a>{' '}
          to validate
        </h3>
        <Upload
          onClick={this._clearInput}
          onChange={this._onChange}
          setRefs={this._setRefs}
        />
        <hr />
        <Options setOption={handleOptionToggle} options={options} />
        <small>
          Note: Selecting a dataset only performs validation. Files are never
          uploaded.
        </small>
      </div>
    )

    return <div className="card">{this.props.loading ? loading : select}</div>
  }
}

export default Validate
