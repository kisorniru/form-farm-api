import React, { Component } from 'react'
import DatePicker from 'react-datepicker'

class DocumentFilters extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(name, date) {
    const unix = (date.getTime() / 1000 | 0)
    this.props.onChangeFilter(name, unix)
  }

  render() {
    const { filters } = this.props
    const { starttime, endtime } = filters
    const startDate = starttime ? new Date(starttime * 1000) : null
    const endDate = endtime ? new Date(endtime * 1000) : null

    return (
      <div className="custom-filters">
        <div className="row">
          <div className="col-md-4">
            <label>Created Start</label>
            <DatePicker
              strictParsing
              dateFormat="MM/dd/yyyy"
              placeholderText="mm/dd/yyyy"
              selected={startDate}
              onChange={date => this.handleChange('starttime', date)}
            />
          </div>
          <div className="col-md-4">
            <label>Created End</label>
            <DatePicker
              strictParsing
              dateFormat="MM/dd/yyyy"
              placeholderText="mm/dd/yyyy"
              selected={endDate}
              onChange={(date) => this.handleChange('endtime', date)}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default DocumentFilters
