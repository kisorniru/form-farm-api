import React, { Component } from 'react'
import { getGroups } from '../../api/groups'
import Dropdown from '../../components/Dropdown'
import RadioButtons from '../../components/RadioButton'

class UserFilters extends Component {
  constructor(props) {
    super(props)

    this.radioOptions = [
      {
        id: 'all',
        label: 'All',
      },
      {
        id: 'admin',
        label: 'Admin',
      },
      {
        id: 'normal',
        label: 'Normal',
      }
    ];

    this.state = {
      groups: []
    }
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

  render() {
    const { filters } = this.props
    const { group, type } = filters
    const groupObject = this.state.groups.find(gr => gr.id == group)

    return (
      <div className="custom-filters">
        <div className="row">
          <div className="col">
            <Dropdown
              name="group"
              label="Group"
              placeholder="Group"
              options={this.state.groups}
              selectedKey={groupObject && groupObject.id}
              selectedValue={groupObject && groupObject.name}
              onChange={(selected) => this.props.onChangeFilter('group', selected.key)}
            />
          </div>

          <div className="col">
            <RadioButtons
              label="Filter by User Type"
              name="type"
              selected={type}
              options={this.radioOptions}
              onChange={(type) => this.props.onChangeFilter('type', type)}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default UserFilters
