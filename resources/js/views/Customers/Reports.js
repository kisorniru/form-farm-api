import React from 'react'
import { stringify } from 'query-string'
import DatePickerField from '../../components/DatePickerField'
import Checkbox from '../../components/Checkbox'

class CustomerReports extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      addDocName: false,
      startTime: null,
      endTime: null,
    }

    this.onChangeParams = this.onChangeParams.bind(this)
    this.buildExportQuery = this.buildExportQuery.bind(this)
  }

  onChangeParams(name, date) {
    this.setState({ [name]: date })
  }

  buildExportQuery(type) {
    const { customerId } = this.props
    const { addDocName, startTime, endTime } = this.state
    const params = {
      format: type,
      template: 'ticket',
      ...(startTime ? { starttime: startTime } : {}),
      ...(endTime ? { endtime: endTime } : {}),
      ...(addDocName ? { add_name: addDocName } : {}),
    }

    return `/customers/${customerId}/documents?${stringify(params)}`
  }

  render() {
    const { startTime, endTime, addDocName } = this.state

    return (
      <div className="container h-100 d-flex flex-column justify-content-around">
        <div className="row">
          <div className="col-md-6">
            <DatePickerField
              parentClass="input-group"
              name="starttime"
              label="from date"
              defaultValue={startTime}
              onChange={(value) => this.onChangeParams('startTime', value)}
            />
          </div>

          <div className="col-md-6">
            <DatePickerField
              parentClass="input-group"
              name="endtime"
              label="To date"
              defaultValue={endTime}
              onChange={(value) => this.onChangeParams('endTime', value)}
            />
          </div>
        </div>
        {/*
          <div className="row">
            <Checkbox
              selected={addDocName}
              name="add_document_name"
              option={{id: 'add_document_name', label: 'Add document name'}}
              onChange={({ checked }) => this.onChangeParams('addDocName', checked)} />
          </div>
        */}

        <div className="row">
          <div className="col-md-6">
            <a href={this.buildExportQuery('csv')} rel="noopener" target="_blank" className="btn btn-block btn-primary">Generate CSV</a>
          </div>

          <div className="col-md-6">
            <a href={this.buildExportQuery('xls')} rel="noopener" target="_blank" className="btn btn-block btn-primary">Generate XLS</a>
          </div>
        </div>
      </div>
    )
  }
}

export default CustomerReports
