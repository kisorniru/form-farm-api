import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { getGroups } from '../../../api/groups'
import { attachGroup, detachGroup } from '../../../api/templates'
import Filters from '../../../components/Filters'
import Pagination from "react-js-pagination"
import Checkbox from '../../../components/Checkbox'

class TemplateGroups extends React.Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      total: 0,
      page: 1,
      groups: [],
      filters: {},
      hasSelection: false,
      selected: '',
      headers: {
        name: 'Group',
        templates: 'Can access',
      }
    }

    this.reset = this.reset.bind(this)
    this.loadData = this.loadData.bind(this)
    this.renderRow = this.renderRow.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
    this.onSelectGroup = this.onSelectGroup.bind(this)
    this.renderTemplates = this.renderTemplates.bind(this)
    this.hasGroupSelected = this.hasGroupSelected.bind(this)
  }

  componentDidMount() {
    this._isMounted = true
    this.loadData()
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  onSelectGroup(id, checked) {
    const { template } = this.props
    const { groups } = this.state
    const group = groups.find(group => group.id === id)
    const gIndex = groups.map(group => group.id).indexOf(id)

    if (checked) {
      attachGroup(template.id, id)
      .then(response => {
        group.templates.push(template)
        groups.splice(gIndex, 1, group)
        this.setState({ groups }, () => NotificationManager.success(response.message))
      })
      .catch(error => NotificationManager.error('There was an error attaching the group'))
    } else {
      detachGroup(template.id, id)
      .then(response => {
        const index = group.templates.map(t => t.id).indexOf(template.id)
        group.templates.splice(index, 1)
        groups.splice(gIndex, 1, group)
        this.setState({ groups }, () => NotificationManager.success(response.message))
      })
      .catch(error => NotificationManager.error('There was an error detaching the group'))
    }
  }

  hasGroupSelected(id) {
    const { template } = this.props
    const { groups } = this.state
    const group = groups.find(group => group.id === id)
    let hasTemplate = false

    if (group.templates) {
      const t = group.templates.find(t => t.id === template.id)
      if (t) {
        hasTemplate = true
      }
    }

    return hasTemplate
  }

  applyFilters (name, value) {
    const filters = {
      ...this.state.filters,
      [name]: value
    }

    if (name !== 'page') {
      filters.page = 1
    }

    if (value.length == 0) {
      delete filters[name]
    }

    this.setState({ filters }, () => {
      this.loadData()
    })
  }

  loadData () {
    getGroups({...this.state.filters, with: 'templates'})
      .then(data => {
        if (this._isMounted) {
          this.setState({
            total: data.meta.total,
            page: data.meta.current_page,
            groups: data.data
          })
        }
      })
      .catch(console.error)
  }

  reset () {
    this.setState({ page: 1, total: 1, filters: {} }, () => {
      this.loadData()
    })
  }

  renderTemplates(id) {
    const { template } = this.props
    const { groups } = this.state
    const group = groups.find(group => group.id === id)
    return group.templates.map(t => (<li key={t.id} className={`${t.id === template.id ? 'active' : 'simple'}`}>{t.name}</li>))
  }

  renderHeader () {
    const { headers } = this.state

    return (
      <tr key="heading">
        <td></td>
        {Object.keys(headers).map((item, index) => (<th key={index}>{headers[item]}</th>))}
      </tr>
    )
  }

  renderRow (group, rowIndex) {
    return (
      <tr key={`row-${rowIndex}`}>
        <td key="massive-selection-group" width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={this.hasGroupSelected(group.id)}
            name="massive-selection-group"
            option={{ id: rowIndex, label: '' }}
            onChange={(target) => this.onSelectGroup(group.id, target.checked)}
          />
        </td>
        <td>
          <span className="initials">{group.name.substring(0, 2).toUpperCase()}</span>
          <span className="name">{group.name}</span>
        </td>
        <td><ul className="groups-list">{this.renderTemplates(group.id)}</ul></td>
      </tr>
    )
  }

  render () {
    const { filters, groups, page, total } = this.state
    const tbodyMarkup = groups.map(this.renderRow)

    return (
      <div className="row mt-4">
        <div className="col-md-12 mt-2">
          <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset} />
        </div>
        <div className="col-md-12 mt-2">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>{this.renderHeader()}</thead>
              <tbody>{tbodyMarkup}</tbody>
            </table>
          </div>
        </div>
        {
          total > 0 &&
          <div className="col-md-12">
            <Pagination
              hideFirstLastPages
              prevPageText='⟨'
              nextPageText='⟩'
              itemClass="page-item"
              linkClass="page-link"
              activePage={page}
              itemsCountPerPage={10}
              totalItemsCount={total}
              pageRangeDisplayed={5}
              onChange={(page) => this.applyFilters('page', page)}
            />
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { template } = state
  return {
    ...template,
    ...props
  }
}

export default connect(mapStateToProps)(TemplateGroups)
