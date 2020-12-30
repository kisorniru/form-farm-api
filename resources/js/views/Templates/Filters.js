import React, { Component } from 'react'
import { getGroups } from '../../api/groups'
import Dropdown from '../../components/Dropdown'
import DatePicker from 'react-datepicker'

class TemplateFilters extends Component {
  constructor(props) {
    super(props)

    this.state = {
      groups: []
    }

    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    getGroups({ limit: 1000 })
      .then(response => {
        const groups = response.data.map(group => {
          return {
            ...group,
            key: group.id,
            value: group.name
          }
        })

        this.setState({ groups })
      })
      .catch(console.error)
  }

  handleChange(name, date) {
    const state = {
      [name]: date
    }
    const unix = (date.getTime() / 1000 | 0)
    this.props.onChangeFilter(name, unix)
  }

  render() {
    const { filters } = this.props
    const { group, starttime, endtime } = filters
    const groupObject = this.state.groups.find(gr => gr.id == group)
    const startDate = starttime ? new Date(starttime * 1000) : null
    const endDate = endtime ? new Date(endtime * 1000) : null


    return (
      <div className="custom-filters">
        <div className="row">
          <div className="col-md-4">
            {/*
            <Dropdown
              name="group"
              label="Group"
              placeholder="Group"
              options={this.state.groups}
              selectedKey={groupObject && groupObject.id}
              selectedValue={groupObject && groupObject.name}
              onChange={(selected) => this.props.onChangeFilter('group', selected.key)}
            />
            */}
          </div>
          <div className="col-md-4">
            <label>Created Start</label>
            <DatePicker
              strictParsing
              dateFormat="MM/dd/yyyy"
              placeholderText="mm/dd/yyyy"
              selected={startDate}
              onChange={(date) => this.handleChange('starttime', date)}
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

export default TemplateFilters
