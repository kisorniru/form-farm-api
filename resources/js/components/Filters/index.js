import React, { Component } from 'react'
import Field from '../Field'

class Filters extends Component {
  constructor (props) {
    super(props)

    this.state = {
      search: '',
      typingTimeout: 0,
    }

    this.onSearch = this.onSearch.bind(this)
  }

  onSearch (event) {
    const self = this

    if (self.state.typingTimeout) {
      clearTimeout(self.state.typingTimeout)
    }

    self.setState({
      search: event.target.value,
      typingTimeout: setTimeout(function () {
        self.props.onChangeSearch('search', self.state.search)
      }, 500)
    })
  }

  render () {
    const { search, buttons } = this.props
    const filterId = Math.random().toString(36).substring(7);

    return (
      <div id="users-filters-accordion" className="filters">
        <div className="card">
          <div className="card-header" id="filters">
            <Field
              parentClass="input-search"
              showLabel={false}
              name="search"
              label="Search"
              placeholder="Search"
              defaultValue={search}
              onChange={this.onSearch}
            />
            <div className="mb-0">
              {
                buttons &&
                buttons()
              }
              <button className="btn btn-link" data-toggle="collapse" data-target={`#filters-content-${filterId}`} aria-expanded="true" aria-controls="filters-content">
                Advanced Filters
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>
          </div>

          <div id={`filters-content-${filterId}`} className="collapse" aria-labelledby="filters" data-parent="#users-filters-accordion">
            <div className="card-body">
              {this.props.children}
              <div className="row">
                <div className="col d-flex justify-content-end">
                  <button className="btn btn-link" onClick={this.props.reset}>Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Filters
